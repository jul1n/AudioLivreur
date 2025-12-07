from gui import App, setup_logging

if __name__ == "__main__":
    setup_logging()
    app = App()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()


