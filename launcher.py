import http.server
import socketserver
import webbrowser
import threading
import tkinter as tk
from tkinter import messagebox
import os
import sys

# Switch to port 5000 to avoid conflicts
PORT = 5000

# Ensure we are serving the correct directory (where this script is)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Use ThreadingMixIn to handle multiple requests (images, modules) handling concurrently
# This fixes ERR_EMPTY_RESPONSE in some browsers which open multiple connections
class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

Handler = http.server.SimpleHTTPRequestHandler

class GameLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("Super Mario Clone Launcher")
        self.root.geometry("350x180")
        self.root.resizable(False, False)

        self.server_thread = None
        self.httpd = None
        self.running = False

        # UI Elements
        self.label = tk.Label(root, text="Super Mario Clone", font=("Arial", 16, "bold"))
        self.label.pack(pady=10)

        self.status_label = tk.Label(root, text="Ready to Start", fg="blue")
        self.status_label.pack(pady=5)

        self.btn_start = tk.Button(root, text="Start Game", command=self.start_game, bg="#4CAF50", fg="white", font=("Arial", 12))
        self.btn_start.pack(pady=10, fill=tk.X, padx=20)

        self.btn_stop = tk.Button(root, text="Stop & Exit", command=self.on_close, bg="#f44336", fg="white", font=("Arial", 10))
        self.btn_stop.pack(pady=5, padx=20)

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def start_server_thread(self):
        try:
            # Bind to localhost explicitly
            self.httpd = ThreadingSimpleServer(("127.0.0.1", PORT), Handler)
            print(f"Serving HTTP on 127.0.0.1 port {PORT}...")
            self.httpd.serve_forever()
        except OSError as e:
            print(f"Error starting server: {e}")
            # Schedule GUI update on main thread
            self.root.after(0, lambda: self.show_error(str(e)))
        except Exception as e:
            print(f"Unexpected error: {e}")
            self.root.after(0, lambda: self.show_error(str(e)))

    def show_error(self, message):
        self.status_label.config(text="Server Failed", fg="red")
        self.btn_start.config(state=tk.NORMAL, text="Start Game")
        self.running = False
        messagebox.showerror("Server Error", f"Could not start server on port {PORT}.\nError: {message}")

    def start_game(self):
        if not self.running:
            self.running = True
            self.status_label.config(text=f"Starting server on port {PORT}...", fg="orange")
            self.btn_start.config(state=tk.DISABLED, text="Game Running...")
            
            self.server_thread = threading.Thread(target=self.start_server_thread, daemon=True)
            self.server_thread.start()
            
            # Brief delay to let server spin up
            self.root.after(1000, self.open_browser)
        else:
            self.open_browser()

    def open_browser(self):
        if self.running:
            self.status_label.config(text=f"Running on http://127.0.0.1:{PORT}", fg="green")
            webbrowser.open(f"http://127.0.0.1:{PORT}")

    def on_close(self):
        if self.httpd:
            print("Shutting down server...")
            self.httpd.shutdown()
            self.httpd.server_close()
        self.root.destroy()
        sys.exit()

if __name__ == "__main__":
    root = tk.Tk()
    app = GameLauncher(root)
    root.mainloop()
