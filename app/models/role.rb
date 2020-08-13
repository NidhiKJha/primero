# frozen_string_literal: true

# The model for Role
class Role < ApplicationRecord
  # include Importable #TODO: This will need to be rewritten
  # include Memoizable
  include Cloneable
  include Configuration

  has_and_belongs_to_many :form_sections, -> { distinct }
  has_and_belongs_to_many :primero_modules, -> { distinct }

  alias_attribute :modules, :primero_modules

  serialize :permissions, Permission::PermissionSerializer

  validates :permissions, presence: { message: 'errors.models.role.permission_presence' }
  validates :name, presence: { message: 'errors.models.role.name_present' },
                   uniqueness: { message: 'errors.models.role.unique_name' }

  before_create :generate_unique_id
  before_save :reject_form_by_module

  scope :by_referral, -> { where(referral: true) }
  scope :by_transfer, -> { where(transfer: true) }

  def has_permitted_form_id?(form_unique_id_id)
    form_sections.map(&:unique_id).include?(form_unique_id_id)
  end

  class << self
    def memoized_dependencies
      [FormSection, PrimeroModule, User]
    end

    # TODO: Used by importer. Refactor?
    def get_unique_instance(attributes)
      find_by_name(attributes['name'])
    end

    def names_and_ids_by_referral
      by_referral.pluck(:name, :unique_id)
    end
    # memoize_in_prod :names_and_ids_by_referral

    def names_and_ids_by_transfer
      by_transfer.pluck(:name, :unique_id)
    end
    # memoize_in_prod :names_and_ids_by_transfer

    def create_or_update(attributes = {})
      record = find_by(unique_id: attributes[:unique_id])
      if record.present?
        record.update_attributes(attributes)
      else
        create!(attributes)
      end
    end

    def id_from_name(name)
      "#{self.name}-#{name}".parameterize.dasherize
    end

    alias super_clear clear
    def clear
      # According documentation this is the best way to delete the values on HABTM relation
      all.each do |f|
        f.form_sections.destroy(f.form_sections)
      end
      super_clear
    end

    alias super_import import
    def import(data)
      data['form_sections'] = FormSection.where(unique_id: data['form_sections']) if data['form_sections'].present?
      super_import(data)
    end

    def export
      all.map do |record|
        record.attributes.tap do |r|
          r.delete('id')
          r['form_sections'] = record.form_sections.pluck(:unique_id)
        end
      end
    end

    def new_with_properties(role_params)
      role = Role.new(role_params.except(:permissions, :form_section_unique_ids, :module_unique_ids))
      if role_params[:form_section_unique_ids].present?
        role.form_sections = FormSection.where(unique_id: role_params[:form_section_unique_ids])
      end
      if role_params[:module_unique_ids].present?
        role.modules = PrimeroModule.where(unique_id: role_params[:module_unique_ids])
      end
      role.permissions = Permission::PermissionSerializer.load(role_params[:permissions].to_h)
      role
    end
  end

  def permitted_forms(record_type = nil, visible_only = false)
    form_sections.where({ parent_form: record_type, visible: (visible_only || nil) }.compact)
  end

  def permitted_roles
    return Role.none if permitted_role_unique_ids.blank?

    Role.where(unique_id: permitted_role_unique_ids)
  end

  def permitted_role_unique_ids
    role_permission = permissions.find { |permission| permission.resource == Permission::ROLE }
    return [] if role_permission&.role_unique_ids&.blank?

    role_permission.role_unique_ids
  end

  def dashboards
    dashboard_permissions = permissions.find { |p| p.resource == Permission::DASHBOARD }
    dashboards = dashboard_permissions&.actions&.map do |action|
      next Dashboard.send(action) if Dashboard::DYNAMIC.include?(action)

      begin
        "Dashboard::#{action.upcase}".constantize
      rescue NameError
        nil
      end
    end || []
    dashboards.compact
  end

  def super_user_role?
    superuser_resources = [
      Permission::CASE, Permission::INCIDENT, Permission::REPORT,
      Permission::ROLE, Permission::USER, Permission::USER_GROUP,
      Permission::AGENCY, Permission::METADATA, Permission::SYSTEM
    ]
    managed_resources?(superuser_resources)
  end

  def user_admin_role?
    admin_only_resources = [
      Permission::ROLE, Permission::USER, Permission::USER_GROUP,
      Permission::AGENCY, Permission::METADATA, Permission::SYSTEM
    ]
    managed_resources?(admin_only_resources)
  end

  def permitted_to_export?
    permissions&.map(&:actions)&.flatten&.compact&.any? { |p| p.start_with?('export') } ||
      permissions&.any? { |p| Permission.records.include?(p.resource) && p.actions.include?(Permission::MANAGE) }
  end

  def generate_unique_id
    self.unique_id ||= Role.id_from_name(name) if name.present?
  end

  def permissions_with_forms
    permissions.select { |p| p.resource.in?(Permission.records) }
  end

  def associate_all_forms
    forms_by_parent = FormSection.all_forms_grouped_by_parent
    role_module_ids = primero_modules.pluck(:unique_id)
    permissions_with_forms.map do |permission|
      form_sections << forms_by_parent[permission.resource].reject do |form|
        form_sections.include?(form) || reject_form?(form, role_module_ids)
      end
      save
    end
  end

  def reject_form?(form, role_module_ids)
    form_modules = form&.primero_modules&.pluck(:unique_id)
    return false unless form_modules.present?

    (role_module_ids & form_modules).blank?
  end

  def reject_form_by_module
    role_module_ids = primero_modules.map(&:unique_id)
    self.form_sections = form_sections.reject { |form| reject_form?(form, role_module_ids) }
  end

  def form_section_unique_ids
    form_sections.pluck(:unique_id)
  end

  def module_unique_ids
    modules.pluck(:unique_id)
  end

  def update_properties(role_properties)
    assign_attributes(role_properties.except(:permissions, :form_section_unique_ids, :module_unique_ids))
    update_forms_sections(role_properties[:form_section_unique_ids])
    update_permissions(role_properties[:permissions])
    update_modules(role_properties[:module_unique_ids])
  end

  private

  def update_forms_sections(form_section_unique_ids)
    return if form_section_unique_ids.nil?

    self.form_sections = FormSection.where(unique_id: form_section_unique_ids)
  end

  def update_permissions(permissions)
    return if permissions.nil?

    self.permissions = Permission::PermissionSerializer.load(permissions.to_h)
  end

  def update_modules(module_unique_ids)
    return if module_unique_ids.nil?

    self.modules = PrimeroModule.where(unique_id: module_unique_ids)
  end

  def managed_resources?(resources)
    current_managed_resources = permissions.select { |p| p.actions == [Permission::MANAGE] }.map(&:resource)
    (resources - current_managed_resources).empty?
  end
end
