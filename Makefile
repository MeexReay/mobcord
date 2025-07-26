DESTDIR ?= ${HOME}/.local

DESKTOP_FILE := $(DESTDIR)/share/applications/ru.themixray.mobcord.desktop

TARGETS := x86_64-unknown-linux-musl x86_64-unknown-linux-gnu aarch64-unknown-linux-musl aarch64-unknown-linux-gnu

DOCKER_VOID_x86_64-unknown-linux-musl := --platform amd64 ghcr.io/void-linux/void-musl:20250701r1@sha256:7d31856cf59e50cd38bd586b7a2e06a33ff6bb0525fb7daffc24faa3196fc3da	
DOCKER_VOID_x86_64-unknown-linux-gnu := --platform amd64 ghcr.io/void-linux/void-glibc:20250701r1@sha256:2e3696ea86fa500d775fdd7270ec8bacf367397192d9fd9bf6e55ee7d90dd2d8
DOCKER_VOID_aarch64-unknown-linux-musl := --platform arm64 ghcr.io/void-linux/void-musl:20250701r1@sha256:07ddadef955026a24f610dca9a7f60336c334b0c78aa2bec01c8dec4a39fbb61
DOCKER_VOID_aarch64-unknown-linux-gnu := --platform arm64 ghcr.io/void-linux/void-glibc:20250701r1@sha256:5f80834514350fbfa12f14b3c931b8272d8740d876def3e6959f4cf67104ca71

VOID_DEPENDENCIES := libadwaita-devel gtk4-devel libwebkitgtk60-devel openssl-devel pkg-config

PACKAGES := build/mobcord-alpine-aarch64.apk

.PHONY: release
release: target/release/mobcord

.PHONY: all
all: $(PACKAGES) $(TARGETS)
	mkdir -p build
	for target in $(TARGETS); do \
		build_dir="build/mobcord-$${target/unknown-linux-/}"; \
		mkdir -p $$build_dir; \
		cp target/$$target/release/mobcord $$build_dir; \
		cp logo.png $$build_dir; \
		cp install.sh $$build_dir; \
		cp uninstall.sh $$build_dir; \
		tar -czf $$build_dir.tar.gz -C $$build_dir .; \
		rm -rf $$build_dir; \
	done

	mkdir -p build/mobcord-legcord
	cp src/script.js build/mobcord-legcord/index.js
	echo "export function onLoad() { onLoadInternal(); }" >> build/mobcord-legcord/index.js
	echo "export function onUnload() { onUnloadInternal(); }" >> build/mobcord-legcord/index.js
	echo "{\"name\": \"Mobcord\", \"description\": \"discord client for mobile linux\"}" > build/mobcord-legcord/plugin.json
	tar -czf build/mobcord-legcord.tar.gz -C build/mobcord-legcord .
	rm -rf build/mobcord-legcord
	
	cp src/script.js build/mobcord-userscript.js
	echo "onLoadInternal();" >> build/mobcord-userscript.js

$(TARGETS): %: target/%/release/mobcord

target/%/release/mobcord:
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
	docker run --rm --network host -ti -v `pwd`:/mnt ${DOCKER_VOID_$*} /bin/sh -c " \
		xbps-install -Syu xbps; \
		xbps-install -Sy rust cargo ${VOID_DEPENDENCIES}; \
		cd /mnt; \
		cargo build -r --target $*; \
		chmod -R 777 target; \
	"
	[ -f $@ ]

build/mobcord-alpine-aarch64.apk: APKBUILD
	mkdir -p build
	docker run --rm --privileged multiarch/qemu-user-static --reset --persistent yes --credential yes
	docker remove alpine-mobcord --force || true
	docker create --name alpine-mobcord --network host -ti --platform arm64 alpine:latest
	docker start alpine-mobcord
	docker exec -ti alpine-mobcord /bin/sh -c " \
		adduser -D user; \
		addgroup user abuild; \
		addgroup user wheel; \
		apk add alpine-sdk sudo git abuild; \
		mkdir -p /var/cache/distfiles; \
		chgrp abuild /var/cache/distfiles; \
		chmod g+w /var/cache/distfiles; \
		mkdir -p /home/user/dev/testing/mobcord; \
		chmod -R 777 /home/user/dev/testing/mobcord; \
	"
	docker cp $< alpine-mobcord:/home/user/dev/testing/mobcord/APKBUILD
	docker exec -tiu user alpine-mobcord /bin/sh -c " \
		git config --global user.name "MeexReay"; \
		git config --global user.email "meexreay@gmail.com"; \
		abuild-keygen -a -n; \
		cd ~/dev/testing/mobcord; \
		abuild checksum; \
		abuild -r || true; \
	"
	docker cp alpine-mobcord:/home/user/packages/testing/aarch64/mobcord-0.1.0-r0.apk $@
	docker stop alpine-mobcord --signal 9
	docker remove alpine-mobcord
	[ -f $@ ]

target/release/mobcord:
	cargo build -r

.PHONY: install
install: target/release/mobcord
	mkdir -p $(DESTDIR)
	mkdir -p $(DESTDIR)/bin
	cp target/release/mobcord $(DESTDIR)/bin/mobcord
	chmod +x $(DESTDIR)/bin/mobcord
	mkdir -p $(DESTDIR)/share/mobcord
	cp logo.png $(DESTDIR)/share/mobcord
	mkdir -p $(DESTDIR)/share/applications
	echo "[Desktop Entry]" > ${DESKTOP_FILE}
	echo "Name=Mobcord" >> ${DESKTOP_FILE}
	echo "Type=Application" >> ${DESKTOP_FILE}
	echo "Comment=discord client for mobile linux" >> ${DESKTOP_FILE}
	echo "Icon=${DESTDIR}/share/mobcord/logo.png" >> ${DESKTOP_FILE}
	echo "Exec=${DESTDIR}/bin/mobcord" >> ${DESKTOP_FILE}
	echo "Categories=Network;" >> ${DESKTOP_FILE}
	echo "StartupNotify=true" >> ${DESKTOP_FILE}
	echo "Terminal=false" >> ${DESKTOP_FILE}
	echo "X-GNOME-UsesNotifications=true" >> ${DESKTOP_FILE}

.PHONY: uninstall
uninstall:
	rm -rf $(DESTDIR)/bin/mobcord
	rm -rf $(DESTDIR)/share/mobcord
	rm ${DESKTOP_FILE}

.PHONY: clean
clean:
	rm -rf target
	rm -rf build
	
