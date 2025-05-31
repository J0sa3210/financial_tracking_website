import json
import logging.config

from pathlib import Path

class AlignedFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': "\033[33m",  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[41m', # Red background
    }
    RESET = '\033[0m'

    def format(self, record):
        level = record.levelname
        padded = f"{level}{self.RESET}:"  # pad to 8 characters
        color = self.COLORS[level]
        record.levelname = f"{color}{padded:<13}"
        return super().format(record)
    
def setup_loggers(config_file: str = "../configs/log_config.json", logger_name: str = "BaseLogger") -> logging.Logger:
    
    logging.basicConfig(level=logging.INFO)

    # Create path
    config_file: Path = Path(config_file)


    # Check if path is valid
    if not config_file.exists():
        logging.warning(f"Path {config_file.absolute} does not exist.")
        return 
    
    if not config_file.is_file() or not config_file.suffix == ".json":
        logging.warning(f"File {config_file.name} is not a JSON file.")
        return
    
    with open(config_file) as f_in:
        config = json.load(f_in)
    
    logging.config.dictConfig(config=config)
    
    custom_logger: logging.Logger = logging.getLogger(logger_name)
    custom_logger.info("Logger succesfully configured.")

    return custom_logger
