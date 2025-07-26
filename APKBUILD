pkgname=mobcord
pkgver=0.1.0
pkgrel=0
pkgdesc="discord client for mobile linux"
url="https://github.com/MeexReay/mobcord"
arch="all"
license="WTFPL"
depends="libadwaita gtk4.0 webkit2gtk-6.0 openssl gstreamer gst-plugins-bad gst-plugins-base gst-plugins-good gst-plugins-ugly gst-libav"
makedepends="libadwaita-dev gtk4.0-dev webkit2gtk-6.0-dev openssl-dev pkgconf pkgconf-dev rust cargo"
install=""
options="!check net"
source="$pkgname-$pkgver.tar.gz::https://github.com/MeexReay/mobcord/archive/refs/heads/main.tar.gz"
builddir="$srcdir/$pkgname-main"

build() {
	RUSTFLAGS="-C target-feature=-crt-static" cargo build -r
}

package() {
	make DESTDIR="$pkgdir"/usr install
	mv "$pkgdir"/usr/bin "$pkgdir"/bin
}
