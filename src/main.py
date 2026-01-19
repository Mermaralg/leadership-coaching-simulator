#!/usr/bin/env python3
"""
Corporate Leadership Coaching Simulator - Main Entry Point
"""

from simulator import LeadershipSimulator


def main():
    """Main entry point for the Leadership Coaching Simulator."""
    print("=" * 60)
    print("Corporate Leadership Coaching Simulator")
    print("=" * 60)
    print()
    
    simulator = LeadershipSimulator()
    simulator.run()


if __name__ == "__main__":
    main()
