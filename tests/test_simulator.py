"""
Tests for the Leadership Coaching Simulator.
"""

import pytest
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from simulator import LeadershipSimulator


class TestLeadershipSimulator:
    """Test cases for LeadershipSimulator class."""
    
    def test_simulator_initialization(self):
        """Test that simulator initializes correctly."""
        simulator = LeadershipSimulator()
        assert simulator.participant_name == ""
        assert simulator.personality_scores == {}
        assert simulator.session_data == []
    
    def test_identify_strengths_high_scores(self):
        """Test strength identification for high scores."""
        simulator = LeadershipSimulator()
        simulator.personality_scores = {
            "Emotional Stability": 85,
            "Conscientiousness": 45
        }
        strengths = simulator._identify_strengths()
        
        assert len(strengths) >= 1
        assert any("Emotional Stability" in s['dimension'] for s in strengths)
    
    def test_identify_strengths_low_scores(self):
        """Test strength identification for low scores."""
        simulator = LeadershipSimulator()
        simulator.personality_scores = {
            "Extraversion": 25
        }
        strengths = simulator._identify_strengths()
        
        assert len(strengths) >= 1
        assert any("Balanced" in s['dimension'] for s in strengths)
    
    def test_identify_development_areas(self):
        """Test development area identification."""
        simulator = LeadershipSimulator()
        simulator.personality_scores = {
            "Openness to Experience": 20,
            "Agreeableness": 90
        }
        development_areas = simulator._identify_development_areas()
        
        assert len(development_areas) >= 1
