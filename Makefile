DESKTOP_FILE=~/.local/share/applications/ru.themixray.mobcord

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

uninstall:
	rm -rf ~/.local/bin/mobcord
	rm -rf ~/.local/share/mobcord
	rm ${DESKTOP_FILE}

clean:
	rm -rf target/release/mobcord
	
