import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from supabase_client import db

class CompetencyAnalyzer:
    def __init__(self, n_clusters=5):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = None
    
    def analyze_teacher_gap(self, teacher_id):
        """
        Analyze individual teacher's competency gaps
        Returns: dict with gap areas, priority, recommended modules
        """
        # Fetch teacher's latest assessment
        assessment = db.get_teacher_assessments(teacher_id)
        
        if not assessment:
            return {
                'teacher_id': teacher_id,
                'error': 'No assessment data found',
                'gap_areas': [],
                'priority': 'unknown',
                'recommended_modules': []
            }
        
        # Extract competency scores
        features = self._extract_features(assessment)
        
        # Identify weak areas (scores < 5 out of 10)
        gap_areas = []
        competency_map = {
            'classroom_management': assessment.get('classroom_management_score', 0),
            'content_knowledge': assessment.get('content_knowledge_score', 0),
            'pedagogy': assessment.get('pedagogy_score', 0),
            'technology_usage': assessment.get('technology_usage_score', 0),
            'student_engagement': assessment.get('student_engagement_score', 0)
        }
        
        for competency, score in competency_map.items():
            if score < 5:
                gap_areas.append(competency)
        
        # Determine priority based on number of gaps
        if len(gap_areas) >= 3:
            priority = 'high'
        elif len(gap_areas) == 2:
            priority = 'medium'
        else:
            priority = 'low'
        
        # Map gaps to training modules
        recommended_modules = self._recommend_modules(gap_areas)
        
        result = {
            'teacher_id': teacher_id,
            'gap_areas': gap_areas,
            'priority': priority,
            'recommended_modules': recommended_modules,
            'scores': competency_map
        }
        
        # Save to Supabase
        db.save_gap_analysis(teacher_id, result)
        
        return result
    
    def analyze_cluster_gaps(self, cluster_id):
        """
        Analyze competency gaps for an entire cluster using K-Means
        Returns: dict with cluster insights and teacher groupings
        """
        # Fetch all teachers in cluster
        teachers = db.get_teachers_by_cluster(cluster_id)
        
        if len(teachers) < self.n_clusters:
            return {'error': 'Not enough teachers for clustering'}
        
        # Collect assessment data
        feature_matrix = []
        teacher_ids = []
        
        for teacher in teachers:
            assessment = db.get_teacher_assessments(teacher['id'])
            if assessment:
                features = self._extract_features(assessment)
                feature_matrix.append(features)
                teacher_ids.append(teacher['id'])
        
        if len(feature_matrix) < self.n_clusters:
            return {'error': 'Insufficient assessment data'}
        
        # Normalize features
        X = np.array(feature_matrix)
        X_scaled = self.scaler.fit_transform(X)
        
        # Apply K-Means clustering
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        cluster_labels = self.kmeans.fit_predict(X_scaled)
        
        # Group teachers by cluster
        cluster_groups = {}
        for i, label in enumerate(cluster_labels):
            if label not in cluster_groups:
                cluster_groups[label] = []
            cluster_groups[label].append({
                'teacher_id': teacher_ids[i],
                'features': feature_matrix[i].tolist()
            })
        
        # Identify common gaps per cluster
        cluster_insights = {}
        for label, group in cluster_groups.items():
            avg_scores = np.mean([t['features'] for t in group], axis=0)
            cluster_insights[f'cluster_{label}'] = {
                'teacher_count': len(group),
                'average_scores': {
                    'classroom_management': round(avg_scores[0], 2),
                    'content_knowledge': round(avg_scores[1], 2),
                    'pedagogy': round(avg_scores[2], 2),
                    'technology_usage': round(avg_scores[3], 2),
                    'student_engagement': round(avg_scores[4], 2)
                },
                'teachers': [t['teacher_id'] for t in group]
            }
        
        return {
            'cluster_id': cluster_id,
            'total_teachers': len(teachers),
            'clusters': cluster_insights
        }
    
    def _extract_features(self, assessment):
        """Convert assessment dict to feature vector"""
        return np.array([
            assessment.get('classroom_management_score', 0),
            assessment.get('content_knowledge_score', 0),
            assessment.get('pedagogy_score', 0),
            assessment.get('technology_usage_score', 0),
            assessment.get('student_engagement_score', 0)
        ])
    
    def _recommend_modules(self, gap_areas):
        """Map competency gaps to training module IDs"""
        module_map = {
            'classroom_management': ['behavior_mgmt_101', 'discipline_strategies'],
            'content_knowledge': ['subject_mastery', 'curriculum_design'],
            'pedagogy': ['active_learning_methods', 'differentiated_instruction'],
            'technology_usage': ['digital_tools_basics', 'online_teaching'],
            'student_engagement': ['parent_communication', 'motivation_techniques']
        }
        
        modules = []
        for gap in gap_areas:
            modules.extend(module_map.get(gap, []))
        
        return list(set(modules))  # Remove duplicates

# Initialize analyzer
analyzer = CompetencyAnalyzer(n_clusters=5)
