use libadwaita as adw;
use libadwaita::prelude::*;
use webkit6::{prelude::*, WebView};

const APP_ID: &str = "ru.themixray.mobcord";

fn main() -> glib::ExitCode {
    let app = adw::Application::builder().application_id(APP_ID).build();
    
    app.connect_activate(move |app| {
        let window = adw::ApplicationWindow::new(app);
        let webview = WebView::new();
        webview.load_uri("https://discord.com/app");
        window.set_content(Some(&webview));

        let settings = WebViewExt::settings(&webview).unwrap();
        settings.set_enable_developer_extras(true);

        // let inspector = webview.inspector().unwrap();
        // inspector.show();
        // 
        window.present();
    });
    
    app.run()
}
