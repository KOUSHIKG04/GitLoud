export interface GitLoudElectronApi {
  platform:
    | "aix"
    | "darwin"
    | "freebsd"
    | "linux"
    | "openbsd"
    | "sunos"
    | "win32"
    | "cygwin"
    | "netbsd";
  windowControls: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}
