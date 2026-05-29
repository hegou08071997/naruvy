module Repo
  module Sync
    SYNC_PATHS = %w[
      .github/instructions
      .github/prompts
      .github/workflows
      modules
      tasks
      properties.yml
      setup.sh
    ].freeze

    FBE_SOURCE = '/Users/levon/Development/fireball3d/shopify_dawn_theme'
    GITHUB_REPO = 'https://github.com/LevonBecker/repo_setup_ruby.git'

    def self.run_from_fbe
      run_from_local(FBE_SOURCE)
    end

    def self.run_from_github
      require 'tmpdir'

      dest_path = Dir.pwd

      $logger.info("Source: #{GITHUB_REPO}")
      $logger.info("Destination: #{dest_path}")
      $logger.info('')

      Dir.mktmpdir('repo_setup_sync') do |tmp|
        clone_path = File.join(tmp, 'repo_setup_ruby')

        $logger.info('Cloning LevonBecker/repo_setup_ruby...')
        unless system("git clone --depth 1 #{GITHUB_REPO} #{clone_path}")
          $logger.error('Failed to clone repo_setup_ruby.')
          exit(1)
        end

        $logger.info('')
        copy_paths(clone_path, dest_path)
      end

      $logger.info('')
      $logger.info('Sync from GitHub complete')
    end

    def self.run_from_local(source_path)
      dest_path = Dir.pwd

      $logger.info("Source: #{source_path}")
      $logger.info("Destination: #{dest_path}")
      $logger.info('')

      unless Dir.exist?(source_path)
        $logger.error("Source path not found: #{source_path}")
        exit(1)
      end

      copy_paths(source_path, dest_path)

      $logger.info('')
      $logger.info('Sync from local complete')
    end

    def self.copy_paths(source_path, dest_path)
      require 'fileutils'

      SYNC_PATHS.each do |rel_path|
        src = File.join(source_path, rel_path)
        dst = File.join(dest_path, rel_path)

        unless File.exist?(src)
          $logger.info("  skip (not found): #{rel_path}")
          next
        end

        if File.directory?(src)
          FileUtils.mkdir_p(dst)
          FileUtils.cp_r("#{src}/.", dst)
          $logger.info("  synced dir:  #{rel_path}/")
        else
          FileUtils.mkdir_p(File.dirname(dst))
          FileUtils.cp(src, dst)
          $logger.info("  synced file: #{rel_path}")
        end
      end
    end
  end
end
