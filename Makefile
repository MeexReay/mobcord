DESKTOP_FILE=~/.local/share/applications/ru.themixray.mobcord.desktop

.PHONY: all
all:
	mkdir -p build
	mkdir -p build/mobcord-x86_64-musl
	mkdir -p build/mobcord-aarch64-musl
	mkdir -p build/mobcord-x86_64-gnu
	mkdir -p build/mobcord-aarch64-gnu
	cross build --release --target x86_64-unknown-linux-musl
	cross build --release --target aarch64-unknown-linux-musl
	cross build --release --target x86_64-unknown-linux-gnu
	cross build --release --target aarch64-unknown-linux-gnu
	cp target/x86_64-unknown-linux-musl/release/mobcord build/mobcord-x86_64-musl
	cp target/aarch64-unknown-linux-musl/release/mobcord build/mobcord-aarch64-musl
	cp target/x86_64-unknown-linux-gnu/release/mobcord build/mobcord-x86_64-gnu
	cp target/aarch64-unknown-linux-gnu/release/mobcord build/mobcord-aarch64-gnu
	cp logo.png build/*
	cp install.sh build/*
	cp uninstall.sh build/*
	mkdir build/mobcord-legcord
	cp src/script.js build/mobcord-legcord/index.js
	echo "export function onLoad() { doAlways(); }" >> build/mobcord-legcord/index.js
	echo "export function onUnload() { /* todo: write unload function */ }" >> build/mobcord-legcord/index.js
	echo "{\"name\": \"Mobcord\", \"description\": \"discord client for mobile linux\"}" > build/mobcord-legcord/plugin.json
	
target/release/mobcord:
	cargo build -r

.PHONY: install
install: target/release/mobcord
	mkdir -p ~/.local
	mkdir -p ~/.local/bin
	cp target/release/mobcord ~/.local/bin/mobcord
	chmod +x ~/.local/bin/mobcord
	mkdir -p ~/.local/share/mobcord
	cp logo.png ~/.local/share/mobcord
	mkdir -p ~/.local/share/applications
	echo "[Desktop Entry]" > ${DESKTOP_FILE}
	echo "Name=Mobcord" >> ${DESKTOP_FILE}
	echo "Type=Application" >> ${DESKTOP_FILE}
	echo "Comment=discord client for mobile linux" >> ${DESKTOP_FILE}
	echo "Icon=${HOME}/.local/share/mobcord/logo.png" >> ${DESKTOP_FILE}
	echo "Exec=${HOME}/.local/bin/mobcord" >> ${DESKTOP_FILE}
	echo "Categories=Network;" >> ${DESKTOP_FILE}
	echo "StartupNotify=true" >> ${DESKTOP_FILE}
	echo "Terminal=false" >> ${DESKTOP_FILE}
	echo "X-GNOME-UsesNotifications=true" >> ${DESKTOP_FILE}

.PHONY: uninstall
uninstall:
	rm -rf ~/.local/bin/mobcord
	rm -rf ~/.local/share/mobcord
	rm ${DESKTOP_FILE}

.PHONY: clean
clean:
	rm -rf target
	
