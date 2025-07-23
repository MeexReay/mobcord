use std::{error::Error, sync::Arc};

use gdk::{Display, RGBA};
use gtk::CssProvider;
use libadwaita as adw;
use libadwaita::prelude::*;
use reqwest::header::USER_AGENT;
use webkit6::{prelude::*, LoadEvent, WebView};

const APP_ID: &str = "ru.themixray.mobcord";

const BACKGROUND_COLOR: RGBA = RGBA::new(0.07, 0.07, 0.078, 1.0);
const DEFAULT_SIZE: (i32, i32) = (432, 936);

fn load_css() {
    let provider = CssProvider::new();
    provider.load_from_data(&format!("
        * {{ background-color: {}; }}
    ", BACKGROUND_COLOR.to_string()));

    gtk::style_context_add_provider_for_display(
        &Display::default().expect("Could not connect to a display."),
        &provider,
        gtk::STYLE_PROVIDER_PRIORITY_APPLICATION,
    );
}

fn load_scripts(webview: &WebView) {
    let script = include_str!("script.js");

    webview.evaluate_javascript(
        &script,
        None,
        None,
        None::<&gio::Cancellable>,
        |_|{}
    );
}

fn on_load_changed(webview: &WebView, event: LoadEvent) {
    println!("{:?}", event);

    if event == LoadEvent::Finished {
        load_scripts(webview);
    }
}

fn create_webview() -> WebView {
    let webview = WebView::new();
    
    let settings = WebViewExt::settings(&webview).unwrap();
    settings.set_enable_developer_extras(true);

    webview.connect_load_changed(on_load_changed);
    webview.set_background_color(&BACKGROUND_COLOR);
    webview.load_uri("https://discord.com/app");

    webview
}

fn on_swipe(_: &gtk::GestureSwipe, x: f64, y: f64) {
    println!("{x}");
}

fn main() -> glib::ExitCode {
    let app = adw::Application::builder().application_id(APP_ID).build();
    
    app.connect_activate(move |app| {
        let window = adw::ApplicationWindow::new(app);

        load_css();
        
        window.set_default_size(DEFAULT_SIZE.0, DEFAULT_SIZE.1);

        let webview = create_webview();
        window.set_content(Some(&webview));

        let ctrl_shift_i = gtk::Shortcut::builder()
            .trigger(&gtk::ShortcutTrigger::parse_string("<Control><Shift>i").unwrap())
            .action(&gtk::CallbackAction::new({
                let webview = webview.clone();
                move |_, _| -> glib::Propagation {
                    let inspector = webview.inspector().unwrap();
                    inspector.show();

                    glib::Propagation::Stop
                }
            }))
            .build();
        
        let controller = gtk::ShortcutController::new();
        controller.add_shortcut(ctrl_shift_i);
        webview.add_controller(controller);

        let swipe_controller = gtk::GestureSwipe::new();
        swipe_controller.connect_swipe(on_swipe);
        webview.add_controller(swipe_controller);
                    
        window.present();
    });
    
    app.run()
}
