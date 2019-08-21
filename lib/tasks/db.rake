require 'restclient'
require 'fileutils'
require 'erb'
require 'readline'


def databases_for_env
    COUCHDB_SERVER.databases
                  .select { |db| db =~ /_#{CouchSettings.instance.db_suffix}$/ }
                  .map { |name| COUCHDB_SERVER.database(name) }
end

namespace :db do

  namespace :test do
    task :prepare do
      # do nothing - work around
      # cucumber is calling this
      # but does not exist anymore
      # in rails 4
    end
  end


  desc "Seed with data (task manually created during the 3.0 upgrade, as it went missing)"
  task :seed => :environment do
    load(Rails.root.join("db", "seeds.rb"))
  end

  task :migrate => :environment do
    Migration.migrate
  end

  desc "Create system administrator for couchdb. This is needed only if you are interested to test out replications"
  task :create_couch_sysadmin, :user_name, :password do |t, args|
    puts "
      **************************************************************
          Welcome to RapidFTR couchdb system administrator setup
      **************************************************************
    "

    url       = "http://localhost:5984"
    user_name = args[:user_name] || get("Enter username for CouchDB: ")
    password  = args[:password]  || get("Enter password for CouchDB: ")

    begin
      RestClient.post "#{url}/_session", "name=#{user_name}&password=#{password}", {:content_type => 'application/x-www-form-urlencoded'}
      puts "Administrator account #{user_name} is already existing and verified"
    rescue RestClient::Request::Unauthorized
      full_host = "#{url}/_config/admins/#{user_name}"
      RestClient.put full_host, "\""+password+"\"", {:content_type => :json}
      puts "Administrator account #{user_name} has been created"
    end
  end

  desc "Create/Copy couchdb.yml from cocuhdb.yml.example"
  task :create_couchdb_yml, :user_name, :password  do |t, args|
    default_env = ENV['RAILS_ENV'] || "development"
    environments = ["development", "test", "cucumber", "production", "uat", "standalone", "android", default_env].uniq
    user_name = ENV['couchdb_user_name'] || args[:user_name] || ""
    password = ENV['couchdb_password'] || args[:password] || ""

    default_config = {
      "host" => "localhost",
      "port" => 5984,
      "https_port" => 6984,
      "prefix" => "primero",
      "username" => user_name,
      "password" => password,
      "ssl" => false
    }

    couchdb_config = {}
    environments.each do |env|
      couchdb_config[env] = default_config.merge("suffix" => "#{env}")
    end

    write_file Rails.root.to_s+"/config/couchdb.yml", couchdb_config.to_yaml
  end

  task :delete => :environment do
    databases_for_env.each do |db|
      db.delete!
    end
  end

  namespace :migrate do
    desc "Resets migrations metadata. Use with extreme caution!!!"
    task :clean => :environment do
      Migration.database.recreate!
    end

    desc "Creates migration metdata up to and including the provided migration without executing the migrations"
    task :fastforward, [:migration] => :environment do |t, args|
      all = Migration.all_migrations
      applied = Migration.applied_migrations
      ff_index = all.find_index(args[:migration])
      all[0..ff_index].each do |migration|
        if applied.include? migration
          puts "Migration #{migration} already applied..."
        else
          puts "Fast forwarding #{migration}..."
          Migration.database.save_doc(name: migration)
        end
      end
    end

    desc "Trigger update of the CouchDB design documents according to the Rails model specification"
    task :design => :environment do |t, args|
      #Temporarily overide autoupdate because CouchRest isn't very well-designed.
      module CouchRest
        module Model
          class Base
            self.auto_update_design_doc = true
          end
        end
      end
      Rails.application.eager_load!
      couch_models = CouchRest::Model::Base.descendants
      couch_models.each do |couch_model|
        if couch_model.respond_to? :design_doc
          puts "Syncing design docs for #{couch_model.name}"
          couch_model.design_docs.each(&:sync!)
        end
      end
    end
  end

end

def write_file name, content
  puts "Writing #{name}..."
  File.open(name, 'w') do |file|
    file.write content
  end
end

def get prompt
  Readline.readline prompt
end

