import os
import urllib.request


def _configure_loopback_proxy_bypass():
    proxies = urllib.request.getproxies()
    bypass = os.environ.get("no_proxy", os.environ.get("NO_PROXY", proxies.get("no", "")))
    hosts = [host.strip() for host in bypass.split(",") if host.strip()]
    if "*" in hosts:
        return

    # On Windows, adding NO_PROXY alone makes urllib stop reading the system
    # proxy. Preserve those proxies before adding the loopback exceptions.
    for scheme in ("http", "https", "all", "ftp"):
        key = f"{scheme.upper()}_PROXY"
        if proxies.get(scheme) and key not in os.environ and key.lower() not in os.environ:
            os.environ[key] = proxies[scheme]

    known_hosts = {host.lower() for host in hosts}
    for host in ("localhost", "127.0.0.1", "::1"):
        if host not in known_hosts:
            hosts.append(host)

    value = ",".join(hosts)
    # urllib gives lowercase variables priority on case-sensitive platforms.
    if "no_proxy" in os.environ:
        os.environ["no_proxy"] = value
    os.environ["NO_PROXY"] = value


def preload(parser):
    _configure_loopback_proxy_bypass()
    parser.add_argument(
        "--lobe-debug",
        action="store_true",
        help="Enable debug logging",
    )
