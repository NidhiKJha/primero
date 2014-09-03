module ImportActions
  extend ActiveSupport::Concern

  def create_new_model(attributes={})
    raise "You must declare a method called 'create_new_model' for this controller to have import capabilities"
  end

  def get_unique_instance(attributes)
    raise "You must declare a method called 'get_unique_instance' for this controller to have import capabilities"
  end

  def update_existing_model(instance, attributes)
    raise "You must declare a method called 'updated_existing_model' for this controller to have import capabilities"
  end

  def import_file
    if params[:import_data].is_a? ActionDispatch::Http::UploadedFile
      file = params[:import_data]
      type = params[:import_type] || file.original_filename.split('.')[-1]

      importer = Importers::ACTIVE_IMPORTERS.select {|imp| imp.id == type}.first
      if importer.nil?
        flash[:error] = "Import type is unknown"
        redirect_to :action => :index and return
      end

      begin
        handle_import(file.tempfile, importer)
      rescue TypeError => e
        flash[:error] = "Error importing data: #{e}"
        redirect_to :action => :index and return
      end
    end

    render :nothing => true
  end

  def handle_import(upload_file, importer)
    model_data = importer.import(upload_file)

    model_data.map do |d|
      (get_unique_instance(d) || create_new_model()).tap do |inst|
        model_type = d.delete('model_type')
        if inst.class.name != model_type
          raise TypeError("Import data model_type field is #{model_type}, expected #{inst.class.name}")
        end

        self.update_existing_model(inst, d)
      end
    end.each {|m| m.save! }
  end

end
