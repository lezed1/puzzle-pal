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
      directory = "./frontend";
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
        excludes = [
          "frontend/**"
          "**.gen.ts"
        ];
        settings = {
          formatter = {
            indentStyle = "space";
          };
          css = {
            parser = {
              tailwindDirectives = true;
            };
          };
        };
      };
    };
  };

  # See full reference at https://devenv.sh/reference/options/

  devcontainer.enable = true;
  difftastic.enable = true;
  delta.enable = true;
}
