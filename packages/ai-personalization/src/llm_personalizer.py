import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

current_dir = Path(__file__).parent
dotenv_path = current_dir.parent.parent.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


class ContentPersonalizer:
    def __init__(self):
        # Configure generation settings for plain text output
        generation_config = {
            "temperature": 0.7,
            "response_mime_type": "text/plain"  # Force plain text output
        }
        self.model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config=generation_config
        )
    
    def personalize_training_module(self, base_module, teacher_profile, cluster_context):
        """
        Use Gemini LLM to adapt training content for teacher's specific needs
        
        Args:
            base_module: dict with 'title', 'content', 'competency_area'
            teacher_profile: dict with 'name', 'subject', 'experience', 'gap_areas'
            cluster_context: dict with 'location', 'common_issues', 'language', 'infrastructure'
        
        Returns:
            dict with 'personalized_content', 'adaptations_made', 'estimated_duration'
        """
        
        prompt = f"""You are an expert educational content designer for teacher professional development in India.


**Teacher Profile:**
- Name: {teacher_profile.get('name', 'Teacher')}
- Subject: {teacher_profile.get('subject', 'General')}
- Experience: {teacher_profile.get('experience', 'Unknown')} years
- Current Competency Gaps: {', '.join(teacher_profile.get('gap_areas', []))}


**Cluster/School Context:**
- Location: {cluster_context.get('location', 'Rural India')}
- Common Classroom Challenges: {cluster_context.get('common_issues', 'Student absenteeism, resource constraints')}
- Primary Language: {cluster_context.get('language', 'Hindi')}
- School Infrastructure: {cluster_context.get('infrastructure', 'Basic - no projector, limited internet')}


**Base Training Module:**
Title: {base_module.get('title', 'Untitled')}
Competency Area: {base_module.get('competency_area', 'General Teaching')}


Content:
{base_module.get('content', 'No content provided')}


---


**Your Task:**
Adapt this training module to make it highly relevant and actionable for this specific teacher. Follow these guidelines:


1. **Localize Language**: Include {cluster_context.get('language', 'Hindi')} terms where helpful, but keep main content in English
2. **Context-Specific Examples**: Replace generic examples with scenarios from {cluster_context.get('location', 'rural schools')} addressing "{cluster_context.get('common_issues', 'common classroom issues')}"
3. **Infrastructure Adaptation**: Modify activities to work with {cluster_context.get('infrastructure', 'basic')} infrastructure (no tech if unavailable)
4. **Competency Focus**: Emphasize solutions for: {', '.join(teacher_profile.get('gap_areas', ['general teaching']))}
5. **Actionable Steps**: Provide 3-5 concrete actions the teacher can implement tomorrow
6. **Duration**: Keep content suitable for 10-15 minute reading time


**Output Format:**
Return ONLY the adapted training content in PLAIN TEXT format. Do NOT use any markdown formatting (no asterisks, no hashes, no special characters for formatting). Include:
- Brief introduction (1 sentence)
- Main concepts (3-4 bullet points using simple dashes)
- Context-specific example scenario
- 3-5 action steps (numbered with plain text)
- Quick reflection question


Do NOT include meta-commentary about the adaptation process.
Do NOT use markdown formatting symbols like **, ##, *, etc.
"""
        
        try:
            response = self.model.generate_content(prompt)
            personalized_content = response.text
            
            return {
                'success': True,
                'personalized_content': personalized_content,
                'original_module_id': base_module.get('id'),
                'estimated_duration': '10-15 minutes',
                'adaptations_made': {
                    'language': cluster_context.get('language'),
                    'location_context': cluster_context.get('location'),
                    'infrastructure_adapted': True,
                    'gap_focused': teacher_profile.get('gap_areas')
                }
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'personalized_content': base_module.get('content'),  # Fallback to base content
                'estimated_duration': '10-15 minutes'
            }
    
    def generate_feedback_prompt(self, training_module, classroom_issues):
        """
        Generate follow-up questions to collect teacher feedback after training
        """
        prompt = f"""Based on this training module about "{training_module.get('title', 'teaching strategies')}", generate 3 short feedback questions to ask the teacher.


The teacher's current classroom challenge is: {classroom_issues}


Questions should:
1. Assess if training addressed their specific issue
2. Check what they tried implementing
3. Ask about student response


Format as a JSON array of question strings."""


        response = self.model.generate_content(prompt)
        return response.text


# Initialize personalizer
personalizer = ContentPersonalizer()
