pkgname=phpizza-desktop
pkgver=0.0.2
pkgrel=1
pkgdesc="PHPizza Desktop"
arch=('x86_64')
url="https://github.com/johnnycharlesw/phpizza-desktop"
license=('GPL-3.0-or-later')

depends=(
    'electron'
    'gtk3'
    'nss'
    'libxss'
    'libnotify'
    'libxtst'
    'xdg-utils'
)

source=(
    "phpizza-desktop-${pkgver}-linux-x86_64.tar.gz"
)

sha256sums=('SKIP')

package() {
    # Application files
    install -dm755 "$pkgdir/usr/lib/phpizza-desktop"

    cp -a "$srcdir/phpizza-desktop-linux-x64/resources/app/." \
        "$pkgdir/usr/lib/phpizza-desktop/"

    # Launcher
    install -Dm755 /dev/stdin \
        "$pkgdir/usr/bin/phpizza-desktop" <<'EOF'
#!/bin/sh
exec electron /usr/lib/phpizza-desktop "$@"
EOF

    # Desktop entry
    install -Dm644 /dev/stdin \
        "$pkgdir/usr/share/applications/phpizza-desktop.desktop" <<'EOF'
[Desktop Entry]
Name=PHPizza Desktop
Comment=PHPizza Desktop
Exec=phpizza-desktop
Icon=phpizza-desktop
Terminal=false
Type=Application
Categories=Utility;
EOF
}