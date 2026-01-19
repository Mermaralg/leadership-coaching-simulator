"""
Core simulator module for the Leadership Coaching Simulator.
"""

from typing import Dict, List, Optional
import json
import os


class LeadershipSimulator:
    """Main simulator class that manages the coaching session flow."""
    
    def __init__(self):
        """Initialize the simulator."""
        self.participant_name = ""
        self.personality_scores = {}
        self.session_data = []
        
    def run(self):
        """Run the main simulation loop."""
        self.welcome()
        self.collect_participant_info()
        self.collect_personality_scores()
        self.analyze_strengths()
        self.analyze_development_areas()
        self.provide_recommendations()
        self.close_session()
        
    def welcome(self):
        """Display welcome message and introduction."""
        print("\nWelcome to the Corporate Leadership Coaching Simulator!")
        print("\nThis interactive tool helps you:")
        print("  • Understand your leadership personality profile")
        print("  • Identify your strengths and development areas")
        print("  • Receive personalized coaching feedback")
        print("  • Practice leadership scenarios")
        print()
        
    def collect_participant_info(self):
        """Collect basic participant information."""
        self.participant_name = input("Please enter your name: ").strip()
        print(f"\nNice to meet you, {self.participant_name}!")
        print("\nWe'll use the Big Five personality model (5D) to assess:")
        print("  1. Emotional Stability")
        print("  2. Conscientiousness")
        print("  3. Extraversion")
        print("  4. Agreeableness")
        print("  5. Openness to Experience")
        print()
        
    def collect_personality_scores(self):
        """Collect personality dimension scores from the participant."""
        print("\nPlease provide your scores (0-100) for each dimension:")
        print("(If you don't have scores, you can use estimated values)")
        print()
        
        dimensions = [
            "Emotional Stability",
            "Conscientiousness", 
            "Extraversion",
            "Agreeableness",
            "Openness to Experience"
        ]
        
        for dimension in dimensions:
            while True:
                try:
                    score = int(input(f"{dimension}: "))
                    if 0 <= score <= 100:
                        self.personality_scores[dimension] = score
                        break
                    else:
                        print("Please enter a score between 0 and 100.")
                except ValueError:
                    print("Please enter a valid number.")
        
        print("\nYour personality profile:")
        for dimension, score in self.personality_scores.items():
            print(f"  {dimension}: {score}")
        
        confirm = input("\nIs this correct? (yes/no): ").strip().lower()
        if confirm != "yes":
            self.personality_scores = {}
            self.collect_personality_scores()
            
    def analyze_strengths(self):
        """Analyze and present participant's strengths."""
        print(f"\n{'-' * 60}")
        print("YOUR STRENGTHS")
        print('-' * 60)
        
        strengths = self._identify_strengths()
        
        if strengths:
            print("\nBased on your profile, here are your key strengths:")
            for i, strength in enumerate(strengths, 1):
                print(f"\n{i}. {strength['dimension']}")
                print(f"   {strength['description']}")
        else:
            print("\nYour profile shows balanced characteristics across dimensions.")
            
    def analyze_development_areas(self):
        """Analyze and present areas for development."""
        print(f"\n{'-' * 60}")
        print("DEVELOPMENT OPPORTUNITIES")
        print('-' * 60)
        
        development_areas = self._identify_development_areas()
        
        if development_areas:
            print("\nAreas where focused development could enhance your leadership:")
            for i, area in enumerate(development_areas, 1):
                print(f"\n{i}. {area['dimension']}")
                print(f"   {area['description']}")
        
    def provide_recommendations(self):
        """Provide personalized recommendations."""
        print(f"\n{'-' * 60}")
        print("PERSONALIZED RECOMMENDATIONS")
        print('-' * 60)
        
        print("\nBased on your profile, consider these action items:")
        print("\n1. Reflect on how your strengths impact your team dynamics")
        print("2. Choose 1-2 development areas to focus on this quarter")
        print("3. Practice scenarios that challenge your comfort zone")
        print("4. Seek feedback from colleagues on your leadership style")
        
    def close_session(self):
        """Close the coaching session."""
        print(f"\n{'=' * 60}")
        print(f"Thank you, {self.participant_name}!")
        print("=" * 60)
        print("\nYour coaching session is complete.")
        print("Remember: Great leaders are made through continuous learning")
        print("and self-reflection.")
        print()
        
    def _identify_strengths(self) -> List[Dict[str, str]]:
        """Identify strengths based on personality scores."""
        strengths = []
        
        for dimension, score in self.personality_scores.items():
            if score >= 70:
                strengths.append({
                    'dimension': dimension,
                    'description': f'Your high score ({score}) indicates strong capability in this area.'
                })
            elif score <= 30:
                strengths.append({
                    'dimension': f"Balanced {dimension}",
                    'description': f'Your measured approach ({score}) can be a strength in certain contexts.'
                })
                
        return strengths
    
    def _identify_development_areas(self) -> List[Dict[str, str]]:
        """Identify development areas based on personality scores."""
        development_areas = []
        
        for dimension, score in self.personality_scores.items():
            if 30 < score < 70:
                continue  # Mid-range scores are generally balanced
            
            if score >= 70:
                development_areas.append({
                    'dimension': f"Moderating {dimension}",
                    'description': f'Consider when your strength ({score}) might become overused.'
                })
            elif score <= 30:
                development_areas.append({
                    'dimension': dimension,
                    'description': f'Building capacity in this area ({score}) could expand your leadership range.'
                })
                
        return development_areas
