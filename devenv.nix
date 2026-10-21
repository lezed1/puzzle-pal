{
  pkgs,
  lib,
  config,
  inputs,
  multiverse,
  ...
}:

{
  # https://devenv.sh/packages/
  packages = [
    pkgs.git
    pkgs.nixfmt
  ];

  languages = {
    typescript = {
      enable = true;
    };

    javascript = {
      enable = true;
      corepack.enable = true;
      npm = {
        enable = true;
      };
      yarn = {
        #        enable = true;
        #        install.enable = true;
      };
    };
  };

  # https://devenv.sh/git-hooks/
  git-hooks.hooks = {
    treefmt.enable = true;
  };

  treefmt = {
    enable = true;
    config.programs = {
      # actionlint.enable = true;
      shellcheck.enable = true;
      shfmt.enable = true;
      nixfmt.enable = true;
      biome = {
        enable = true;
        formatCommand = "check";
        validate.enable = false;
      };
    };
    # Drop treefmt-nix's generated --config-path so Biome reads the repo's biome.json,
    # keeping treefmt, `npx biome`, and editors on one config.
    config.settings.formatter.biome.options = lib.mkForce [
      "check"
      "--write"
      "--no-errors-on-unmatched"
    ];
  };

  # See full reference at https://devenv.sh/reference/options/

  devcontainer.enable = true;
  difftastic.enable = true;
  delta.enable = true;
}
