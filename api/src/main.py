from dotenv import load_dotenv
from .core.bootstrap import create_app

# Load environment variables
load_dotenv()

# Create the FastAPI application with proper architecture
app = create_app()
