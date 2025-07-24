# mobcord

Discord client for mobile linux

## Installation

### As a standalone app

#### Prebuilt binary

Download prebuilt binary from releases and run:

```sh
git clone https://github.com/MeexReay/mobcord
cd mobcord
mkdir -p target
mkdir -p target/release
cp /path/to/binary/mobcord target/release/mobcord
make install
```

#### Build manually

Install all dependencies (see shell.nix) and run:

```sh
git clone https://github.com/MeexReay/mobcord
cd mobcord
make install
```

### As userscript

Webkit2gtk can be quite slow on some devices, so it fine to install the mobcord patches as userscript to your normal browser.
To do that, download src/script.js and add it to your userscript manager.

## See more

- [Vendroid](https://github.com/Vencord/Vendroid) - works on waydroid, uses discord web too
- [Vesktop on flathub](https://flathub.org/apps/dev.vencord.Vesktop) - works on postmarketOS, no mobile patches

## Contributing

If you would like to contribute to the project, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the WTFPL License
