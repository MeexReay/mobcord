DESKTOP_FILE := ~/.local/share/applications/ru.themixray.mobcord.desktop

TARGETS := x86_64-unknown-linux-musl \
	x86_64-unknown-linux-gnu \
	aarch64-unknown-linux-musl \
	aarch64-unknown-linux-gnu

DOCKER_VOID_x86_64-unknown-linux-musl := --platform amd64 ghcr.io/void-linux/void-musl:20250701r1@sha256:7d31856cf59e50cd38bd586b7a2e06a33ff6bb0525fb7daffc24faa3196fc3da	
DOCKER_VOID_x86_64-unknown-linux-gnu := --platform amd64 ghcr.io/void-linux/void-glibc:20250701r1@sha256:2e3696ea86fa500d775fdd7270ec8bacf367397192d9fd9bf6e55ee7d90dd2d8
DOCKER_VOID_aarch64-unknown-linux-musl := --platform arm64 ghcr.io/void-linux/void-musl:20250701r1@sha256:07ddadef955026a24f610dca9a7f60336c334b0c78aa2bec01c8dec4a39fbb61
DOCKER_VOID_aarch64-unknown-linux-gnu := --platform arm64 ghcr.io/void-linux/void-glibc:20250701r1@sha256:5f80834514350fbfa12f14b3c931b8272d8740d876def3e6959f4cf67104ca71

VOID_DEPENDENCIES=libadwaita-devel gtk4-devel libwebkitgtk60-devel openssl-devel pkg-config

.PHONY: all
all: $(TARGETS)
	mkdir -p build
	for target in $(TARGETS); do \
		build_dir="build/mobcord-$${target/unknown-linux-/}"; \
		mkdir -p $$build_dir; \
		cp target/$$target/release/mobcord $$build_dir; \
		cp logo.png $$build_dir; \
		cp install.sh $$build_dir; \
		cp uninstall.sh $$build_dir; \
	done
	mkdir -p build/mobcord-legcord
	cp src/script.js build/mobcord-legcord/index.js
	echo "export function onLoad() { doAlways(); }" >> build/mobcord-legcord/index.js
	echo "export function onUnload() { /* todo: write unload function */ }" >> build/mobcord-legcord/index.js
	echo "{\"name\": \"Mobcord\", \"description\": \"discord client for mobile linux\"}" > build/mobcord-legcord/plugin.json

$(TARGETS): %: target/%/release/mobcord

target/%/release/mobcord:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker run --network host -ti -v `pwd`:/mnt ${DOCKER_VOID_$*} /bin/sh -c " \
		xbps-install -Syu xbps; \
		xbps-install -Sy rust cargo ${VOID_DEPENDENCIES}; \
		cd /mnt; \
		cargo build -r --target $*; \
		chmod -R 777 target; \
	"
	[ -f $@ ]

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
	rm -rf build
	
