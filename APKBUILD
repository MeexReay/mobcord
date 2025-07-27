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
source="mobcord-src.tar.gz"
builddir="$srcdir/mobcord-src"

build() {
	RUSTFLAGS="-C target-feature=-crt-static" cargo build -r
}

package() {
	make HOSTDIR=/usr DESTDIR="$pkgdir"/usr install
}
