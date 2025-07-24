use std::{fs, path::{Path, PathBuf}};

use gdk::{Display, RGBA};
use gtk::CssProvider;
use libadwaita as adw;
use libadwaita::prelude::*;
use webkit6::{prelude::*, LoadEvent, NetworkProxySettings, NetworkSession, WebView};
use clap::Parser;

const APP_ID: &str = "ru.themixray.mobcord";

const BACKGROUND_COLOR: RGBA = RGBA::new(0.07, 0.07, 0.078, 1.0);
const DEFAULT_SIZE: (i32, i32) = (432, 936);

/// MobCord - discord for mobile linux
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Enable hardware acceleration
    #[arg(short='H', long)]
    hardware_acceleration: bool,
    
    /// Set user agent string
    #[arg(short, long, default_value = "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15")]
    user_agent: String,

    /// Set discord app url
    #[arg(short, long, default_value = "https://discord.com/app")]
    discord_app: String,
    
    /// Set proxy
    #[arg(short, long)]
    proxy: Option<String>,
}

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

fn create_webview(work_dir: &Path, args: &Args) -> WebView {
    let data_dir = work_dir.join("data");
    let cache_dir = work_dir.join("cache");

    if !fs::exists(&data_dir).unwrap_or_default() {
        fs::create_dir(&data_dir).expect("data directory creation failure");
    }
    if !fs::exists(&cache_dir).unwrap_or_default() {
        fs::create_dir(&cache_dir).expect("cache directory creation failure");
    }
    
    let network_session = NetworkSession::new(data_dir.to_str(), cache_dir.to_str());
    
    if let Some(proxy) = &args.proxy {
        network_session.set_proxy_settings(
            webkit6::NetworkProxyMode::Custom,
            Some(&NetworkProxySettings::new(Some(&proxy), &[]))
        );
    }

    let webview = WebView::builder()
        .network_session(&network_session)
        .build();
    
    let settings = WebViewExt::settings(&webview).unwrap();
    settings.set_enable_developer_extras(true);
    
    settings.set_user_agent(Some(&args.user_agent));
    if args.hardware_acceleration {
        settings.set_hardware_acceleration_policy(webkit6::HardwareAccelerationPolicy::Always);
    }
    
    webview.connect_load_changed(on_load_changed);
    webview.set_background_color(&BACKGROUND_COLOR);
    
    webview.load_uri(&args.discord_app);

    webview
}

fn main() {
    let args = Args::parse();
    
    let app = adw::Application::builder().application_id(APP_ID).build();

    let home = std::env::var("HOME").expect("home var not set");
    let work_dir: PathBuf = format!("{home}/.local/share/mobcord").into();
    if !fs::exists(&work_dir).unwrap_or_default() {
        fs::create_dir_all(&work_dir).expect("local share directory creation failure");
    }
    
    app.connect_activate(move |app| {
        let window = adw::ApplicationWindow::new(app);

        load_css();
        
        window.set_default_size(DEFAULT_SIZE.0, DEFAULT_SIZE.1);

        let webview = create_webview(&work_dir, &args);
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

        window.present();
    });
    
    app.run_with_args::<&str>(&[]);
}
