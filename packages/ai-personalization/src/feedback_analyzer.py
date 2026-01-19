import re
from typing import List, Dict
from supabase_client import db
from ml_engine import analyzer

class FeedbackAnalyzer:
    """Analyzes teacher feedback to identify competency gaps"""
    
    def __init__(self):
        # Load issue-to-competency mappings from database
        self.mappings = self._load_mappings()
    
    def _load_mappings(self) -> List[Dict]:
        """Load issue keyword mappings from database"""
        try:
            response = db.client.table('issue_competency_mapping').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error loading mappings: {e}")
            return []
    
    def analyze_teacher_feedback(self, teacher_id: str) -> Dict:
        """
        Analyze all feedback from a teacher to identify competency gaps
        
        Returns:
            {
                'teacher_id': str,
                'total_issues': int,
                'inferred_gaps': List[str],
                'priority': str,
                'issue_summary': List[Dict]
            }
        """
        # Fetch all feedback from this teacher
        try:
            response = db.client.table('feedback')\
                .select('*')\
                .eq('teacher_id', teacher_id)\
                .order('created_at', desc=True)\
                .execute()
            
            feedback_items = response.data
        except Exception as e:
            print(f"Error fetching feedback: {e}")
            return {'error': str(e)}
        
        if not feedback_items:
            return {
                'teacher_id': teacher_id,
                'total_issues': 0,
                'inferred_gaps': [],
                'priority': 'low',
                'issue_summary': []
            }
        
        # Analyze issues to infer competency gaps
        gap_scores = {
            'classroom_management': 0,
            'content_knowledge': 0,
            'pedagogy': 0,
            'technology_usage': 0,
            'student_engagement': 0
        }
        
        issue_summary = []
        
        for item in feedback_items:
            issue_text = item['description'].lower()
            matched_gaps = self._match_issue_to_gaps(issue_text)
            
            for gap, confidence in matched_gaps.items():
                gap_scores[gap] += confidence
            
            issue_summary.append({
                'issue': item['description'],
                'status': item['status'],
                'matched_competencies': list(matched_gaps.keys()),
                'created_at': item['created_at']
            })
        
        # Identify top gaps (scores above threshold)
        threshold = 1.0  # At least one strong match
        inferred_gaps = [
            gap for gap, score in gap_scores.items() 
            if score >= threshold
        ]
        
        # Determine priority based on number of issues
        if len(feedback_items) >= 5:
            priority = 'high'
        elif len(feedback_items) >= 3:
            priority = 'medium'
        else:
            priority = 'low'
        
        return {
            'teacher_id': teacher_id,
            'total_issues': len(feedback_items),
            'inferred_gaps': inferred_gaps,
            'gap_scores': gap_scores,
            'priority': priority,
            'issue_summary': issue_summary[:5]  # Latest 5 issues
        }
    
    def analyze_cluster_feedback(self, cluster_id: str) -> Dict:
        """
        Analyze all feedback from a cluster to identify common issues
        """
        try:
            response = db.client.table('feedback')\
                .select('*')\
                .eq('cluster', cluster_id)\
                .execute()
            
            feedback_items = response.data
        except Exception as e:
            return {'error': str(e)}
        
        if not feedback_items:
            return {
                'cluster_id': cluster_id,
                'total_issues': 0,
                'common_issues': [],
                'affected_teachers': 0
            }
        
        # Aggregate issues
        issue_counts = {}
        teacher_ids = set()
        
        for item in feedback_items:
            issue = item['description']
            issue_counts[issue] = issue_counts.get(issue, 0) + 1
            teacher_ids.add(item['teacher_id'])
        
        # Sort by frequency
        common_issues = sorted(
            issue_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        return {
            'cluster_id': cluster_id,
            'total_issues': len(feedback_items),
            'affected_teachers': len(teacher_ids),
            'common_issues': [
                {'description': issue, 'frequency': count} 
                for issue, count in common_issues
            ]
        }
    
    def _match_issue_to_gaps(self, issue_text: str) -> Dict[str, float]:
        """
        Match issue text to competency gaps using keyword mappings
        
        Returns: {'competency_area': confidence_score}
        """
        matched_gaps = {}
        
        for mapping in self.mappings:
            keyword = mapping['issue_keyword'].lower()
            
            # Check if keyword appears in issue text
            if keyword in issue_text:
                competency = mapping['competency_area']
                confidence = float(mapping['confidence_score'])
                
                # If multiple keywords match same competency, take max confidence
                if competency in matched_gaps:
                    matched_gaps[competency] = max(matched_gaps[competency], confidence)
                else:
                    matched_gaps[competency] = confidence
        
        return matched_gaps
    
    def create_assessment_from_feedback(self, teacher_id: str) -> Dict:
        """
        Create a teacher assessment record based on feedback analysis
        This can be used when actual assessment data is missing
        
        Returns: Assessment scores (0-10 scale)
        """
        feedback_analysis = self.analyze_teacher_feedback(teacher_id)
        
        # Convert gap scores to 0-10 scale (inverse - more issues = lower score)
        max_possible_score = 10.0
        gap_scores = feedback_analysis.get('gap_scores', {})
        
        # Issues reduce the score (each issue point = -1 from baseline 7)
        baseline = 7
        
        assessment_scores = {}
        for competency, issue_score in gap_scores.items():
            # More issues = lower score
            adjusted_score = max(0, min(10, baseline - issue_score))
            assessment_scores[competency] = int(adjusted_score)
        
        # If no issues in a competency, assume decent performance
        for competency in ['classroom_management', 'content_knowledge', 'pedagogy', 
                          'technology_usage', 'student_engagement']:
            if competency not in assessment_scores:
                assessment_scores[competency] = baseline
        
        return assessment_scores

# Initialize analyzer
feedback_analyzer = FeedbackAnalyzer()
