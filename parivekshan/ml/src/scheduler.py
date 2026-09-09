"""
Scheduler for periodic model retraining.
Runs the retrain pipeline on a configurable interval.

Usage:
    python scheduler.py [--interval HOURS]
"""

import os
import sys
import time
import argparse
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('scheduler')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
ML_DIR = os.path.dirname(SCRIPT_DIR)


def run_retrain():
    """Run the retrain pipeline."""
    from retrain_pipeline import run_pipeline
    logger.info("Starting retrain pipeline...")
    try:
        result = run_pipeline()
        logger.info(f"Retrain complete: {result.get('status', 'unknown')}")
        return result
    except Exception as e:
        logger.error(f"Retrain failed: {e}")
        return {'status': 'error', 'message': str(e)}


def main():
    parser = argparse.ArgumentParser(description='Freebuff Model Retrain Scheduler')
    parser.add_argument('--interval', type=float, default=1.0,
                        help='Retrain interval in hours (default: 1.0)')
    parser.add_argument('--once', action='store_true',
                        help='Run once and exit')
    args = parser.parse_args()

    interval_seconds = args.interval * 3600

    logger.info(f"Scheduler started. Interval: {args.interval} hours ({interval_seconds}s)")

    if args.once:
        result = run_retrain()
        print(f"Result: {result}")
        return

    while True:
        try:
            run_retrain()
        except Exception as e:
            logger.error(f"Scheduler cycle failed: {e}")

        logger.info(f"Next retrain in {args.interval} hours...")
        time.sleep(interval_seconds)


if __name__ == '__main__':
    main()
