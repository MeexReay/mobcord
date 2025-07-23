use gdk::{Display, RGBA};
use gtk::CssProvider;
use libadwaita as adw;
use libadwaita::prelude::*;
use webkit6::{prelude::*, WebView};

const APP_ID: &str = "ru.themixray.mobcord";

const BACKGROUND_COLOR: RGBA = RGBA::new(0.07, 0.07, 0.078, 1.0);

fn main() -> glib::ExitCode {
    let app = adw::Application::builder().application_id(APP_ID).build();
    
    app.connect_activate(move |app| {
        let provider = CssProvider::new();
        provider.load_from_data(&format!("
            * {{ background-color: {}; }}
        ", BACKGROUND_COLOR.to_string()));

        gtk::style_context_add_provider_for_display(
            &Display::default().expect("Could not connect to a display."),
            &provider,
            gtk::STYLE_PROVIDER_PRIORITY_APPLICATION,
        );
    
        let window = adw::ApplicationWindow::new(app);

        window.set_default_size(432, 936);

        let webview = WebView::new();
        webview.set_background_color(&BACKGROUND_COLOR);
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
