# mobcord

Discord client for mobile linux

## Installation

### As a standalone app

#### Prebuilt binary

Download prebuilt archive from releases and run `./install.sh`, to uninstall run `./uninstall.sh`

#### Prebuilt alpine package (postmarketOS)

Silly oneliner:

```sh
curl -Lo mobcord.apk https://github.com/MeexReay/mobcord/releases/latest/download/mobcord-alpine-aarch64.apk && sudo apk add --allow-untrusted mobcord.apk
```

#### Build manually

Install all dependencies (see shell.nix) and run:

```sh
git clone https://github.com/MeexReay/mobcord
cd mobcord
make install
# make uninstall # to uninstall
```

### As userscript

Webkit2gtk can be quite slow on some devices, so it fine to install the mobcord patches as userscript to your normal browser.
To do that, download latest `mobcord-userscript.js` from releases and add it to your userscript manager.

### As legcord plugin

Download latest `mobcord-legcord.tar.gz` from releases, unzip it and add to legcord plugins.

## See more

- [Vendroid](https://github.com/Vencord/Vendroid) - works on waydroid, uses discord web too
- [Vesktop on flathub](https://flathub.org/apps/dev.vencord.Vesktop) - works on postmarketOS, no mobile patches
- [Legcord](https://github.com/Legcord/Legcord) - has experimental mobile support

## Contributing

If you would like to contribute to the project, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the WTFPL License
