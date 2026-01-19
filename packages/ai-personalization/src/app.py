from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_engine import analyzer
from llm_personalizer import personalizer
from feedback_analyzer import feedback_analyzer
from supabase_client import db
import os
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'personalization-service'})

@app.route('/api/analyze-feedback/<teacher_id>', methods=['POST'])
def analyze_teacher_feedback(teacher_id):
    """Analyze teacher's feedback to identify competency gaps"""
    try:
        result = feedback_analyzer.analyze_teacher_feedback(teacher_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_teacher_feedback: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-cluster-feedback/<cluster_id>', methods=['POST'])
def analyze_cluster_feedback(cluster_id):
    """Analyze cluster's feedback"""
    try:
        result = feedback_analyzer.analyze_cluster_feedback(cluster_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_cluster_feedback: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-teacher-gaps', methods=['POST'])
def analyze_teacher_gaps():
    """Analyze individual teacher's competency gaps"""
    try:
        data = request.json
        teacher_id = data.get('teacher_id')
        
        if not teacher_id:
            return jsonify({'error': 'teacher_id required'}), 400
        
        result = analyzer.analyze_teacher_gap(teacher_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_teacher_gaps: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-cluster-gaps', methods=['POST'])
def analyze_cluster_gaps():
    """Analyze competency gaps for entire cluster"""
    try:
        data = request.json
        cluster_id = data.get('cluster_id')
        
        if not cluster_id:
            return jsonify({'error': 'cluster_id required'}), 400
        
        result = analyzer.analyze_cluster_gaps(cluster_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_cluster_gaps: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback-to-training', methods=['POST'])
def feedback_to_training():
    """Convert teacher feedback into personalized training assignment"""
    try:
        print("\n=== FEEDBACK TO TRAINING ROUTE ===")
        data = request.json
        print(f"Request data: {data}")
        
        teacher_id = data.get('teacher_id')
        feedback_id = data.get('feedback_id')
        admin_id = data.get('admin_id')
        
        if not teacher_id or not feedback_id:
            return jsonify({'error': 'teacher_id and feedback_id required'}), 400
        
        # 1. Analyze feedback
        print(f"Analyzing feedback for teacher: {teacher_id}")
        feedback_analysis = feedback_analyzer.analyze_teacher_feedback(teacher_id)
        inferred_gaps = feedback_analysis.get('inferred_gaps', [])
        
        print(f"Inferred gaps: {inferred_gaps}")
        
        if not inferred_gaps:
            return jsonify({
                'error': 'No competency gaps identified',
                'suggestion': 'Try manual assessment'
            }), 400
        
        # 2. Get teacher
        print("Fetching teacher data...")
        teacher = db.get_teacher_by_id(teacher_id)
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        print(f"Teacher: {teacher.get('name')}")
        
        # 3. Get cluster context
        cluster_id = teacher.get('cluster_id')
        print(f"Fetching cluster data: {cluster_id}")
        
        try:
            cluster_response = db.client.table('clusters').select('*').eq('id', cluster_id).execute()
            cluster_data = cluster_response.data[0] if cluster_response.data else {}
        except Exception as e:
            print(f"Cluster fetch error: {e}")
            cluster_data = {}
        
        cluster_context = {
            'location': cluster_data.get('location', 'Rural India'),
            'common_issues': ', '.join(cluster_data.get('common_challenges', [])) if cluster_data.get('common_challenges') else 'general challenges',
            'language': cluster_data.get('primary_language', 'Hindi'),
            'infrastructure': cluster_data.get('infrastructure_level', 'basic')
        }
        
        print(f"Cluster context: {cluster_context}")
        
        # 4. Get base training module
        print(f"Fetching training module for competency: {inferred_gaps[0]}")
        try:
            module_response = db.client.table('training_modules')\
                .select('*')\
                .eq('competency_area', inferred_gaps[0])\
                .limit(1)\
                .execute()
            
            if not module_response.data:
                return jsonify({'error': 'No training module found'}), 404
            
            base_module = module_response.data[0]
            print(f"Base module: {base_module['title']}")
        except Exception as e:
            print(f"Module fetch error: {e}")
            traceback.print_exc()
            return jsonify({'error': f'Failed to fetch module: {str(e)}'}), 500
        
        # 5. Generate personalized training
        print("Generating personalized content with AI...")
        teacher_profile = {
            'name': teacher.get('name'),
            'subject': teacher.get('subject'),
            'experience': teacher.get('experience_years', 3),
            'gap_areas': inferred_gaps
        }
        
        try:
            personalized = personalizer.personalize_training_module(
                base_module=base_module,
                teacher_profile=teacher_profile,
                cluster_context=cluster_context
            )
            
            if not personalized.get('success'):
                return jsonify({'error': 'Failed to personalize content'}), 500
            
            print("✅ Personalization successful")
        except Exception as e:
            print(f"❌ Personalization error: {e}")
            traceback.print_exc()
            return jsonify({'error': f'Personalization failed: {str(e)}'}), 500
        
        # 6. Save personalized training
        print("Saving to database...")
        try:
            db.save_personalized_training(
                teacher_id=teacher_id,
                module_id=base_module['id'],
                personalized_content=personalized['personalized_content'],
                metadata=personalized['adaptations_made']
            )
        except Exception as e:
            print(f"Database save error: {e}")
            traceback.print_exc()
        
        # 7. Update feedback status
        try:
            db.client.table('feedback').update({
                'status': 'training_assigned'
            }).eq('id', feedback_id).execute()
        except Exception as e:
            print(f"Feedback update error: {e}")
        
        print("=== FEEDBACK TO TRAINING COMPLETE ===\n")
        
        return jsonify({
            'success': True,
            'feedback_id': feedback_id,
            'teacher_id': teacher_id,
            'inferred_gaps': inferred_gaps,
            'assigned_module': base_module['title'],
            'personalized_content_preview': personalized['personalized_content'][:200] + '...'
        })
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"\n{'='*50}")
    print(f"🚀 Personalization Service Starting...")
    print(f"{'='*50}\n")
    app.run(host='0.0.0.0', port=port, debug=True)
