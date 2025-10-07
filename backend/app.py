import os
from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    # allow Vite dev server during development
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173","http://127.0.0.1:5173"]}})

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True)
