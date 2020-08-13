# frozen_string_literal: true

require 'rails_helper'

describe Role do
  before :each do
    clean_data(Role, PrimeroModule)
  end
  it 'should not be valid if name is empty' do
    role = Role.new
    role.should_not be_valid
    role.errors[:name].should == ['errors.models.role.name_present']
  end

  it 'should not be valid if permissions is empty' do
    role = Role.new
    role.should_not be_valid
    role.errors[:permissions].should == ['errors.models.role.permission_presence']
  end

  it 'should sanitize and check for permissions' do
    role = Role.new(name: 'Name', permissions: [])
    role.save
    role.should_not be_valid
    role.errors[:permissions].should == ['errors.models.role.permission_presence']
  end

  it 'should not be valid if a role name has been taken already' do
    Role.create(
      name: 'Unique', permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    )
    role = Role.new(
      name: 'Unique', permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    )
    role.should_not be_valid
    role.errors[:name].should == ['errors.models.role.unique_name']
  end

  it 'should create a valid role' do
    Role.new(
      name: 'some_role', permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    ).should be_valid
  end

  it 'should create a valid transfer role' do
    Role.new(
      name: 'some_role', transfer: true,
      permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    ).should be_valid
  end

  it 'should create a valid referral role' do
    Role.new(
      name: 'some_role', referral: true,
      permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    ).should be_valid
  end

  it 'should generate unique_id' do
    role = Role.new(
      name: 'test role 1234',
      permissions: [Permission.new(resource: Permission::CASE, actions: [Permission::MANAGE])]
    )
    role.save(validate: false)
    expect(role.unique_id).to eq('role-test-role-1234')
  end

  describe '.super_user_role?' do
    before do
      super_user_permissions_to_manage = [
        Permission::CASE, Permission::INCIDENT, Permission::REPORT,
        Permission::ROLE, Permission::USER, Permission::USER_GROUP,
        Permission::AGENCY, Permission::METADATA, Permission::SYSTEM
      ]
      @permissions_super_user =
        super_user_permissions_to_manage.map { |p| Permission.new(resource: p, actions: [Permission::MANAGE]) }
      @permission_not_super_user = Permission.new(resource: Permission::ROLE, actions: [Permission::MANAGE])
    end

    context 'depending on the permissions of a role' do
      before do
        @role_super_user = Role.new(name: 'super_user_role', permissions: @permissions_super_user)
        @role_not_super_user = Role.new(name: 'not_super_user_role', permissions: [@permission_not_super_user])
      end
      context 'if the role manages all of the permissions of the super user' do
        it 'should return true for super_user_role?' do
          expect(@role_super_user.super_user_role?).to be_truthy
        end
      end

      context 'if the role does not manage all of the permissions of the super user' do
        it 'should return false for super_user_role?' do
          expect(@role_not_super_user.super_user_role?).to be_falsey
        end
      end
    end
  end

  describe 'user_admin_role?' do
    before do
      user_admin_permissions_to_manage = [
        Permission::ROLE, Permission::USER, Permission::USER_GROUP,
        Permission::AGENCY, Permission::METADATA, Permission::SYSTEM
      ]
      @permissions_user_admin =
        user_admin_permissions_to_manage.map { |p| Permission.new(resource: p, actions: [Permission::MANAGE]) }
      @permission_not_user_admin = Permission.new(resource: Permission::ROLE, actions: [Permission::MANAGE])
    end

    context 'depending on the permissions of a role' do
      before do
        @role_user_admin = Role.new(name: 'super_user_role', permissions: @permissions_user_admin)
        @role_not_user_admin = Role.new(name: 'not_super_user_role', permissions: [@permission_not_user_admin])
      end
      context 'if the role manages all of the permissions of the user admin' do
        it 'should return true for user_admin_role?' do
          expect(@role_user_admin.user_admin_role?).to be_truthy
        end
      end

      context 'if the role does not manage all of the permissions of the user admin' do
        it 'should return false for user_admin_role?' do
          expect(@role_not_user_admin.user_admin_role?).to be_falsey
        end
      end
    end
  end

  describe 'class methods' do
    before do
      clean_data(Role)
      role_permissions = [Permission.new(resource: Permission::CASE, actions: [Permission::READ])]
      @referral_role = Role.create!(name: 'Referral Role', permissions: role_permissions, referral: true)
      @transfer_role = Role.create!(name: 'Transfer Role', permissions: role_permissions, transfer: true)
      @referral_transfer_role =
        Role.create!(name: 'Referral Transfer Role', permissions: role_permissions, referral: true, transfer: true)
      @neither_role = Role.create!(name: 'Neither Role', permissions: role_permissions)
    end

    describe 'names_and_ids_by_referral' do
      it 'returns Names and IDs of all roles with referral permission' do
        expect(Role.names_and_ids_by_referral).to include(
          ['Referral Role', 'role-referral-role'], ['Referral Transfer Role', 'role-referral-transfer-role']
        )
      end

      it 'does not return Names and IDs of roles that do not have referral permission' do
        expect(Role.names_and_ids_by_referral).not_to include(
          ['Transfer Role', 'role-transfer-role'], ['Neither Role', 'role-neither-role']
        )
      end
    end

    describe 'names_and_ids_by_transfer' do
      it 'returns Names and IDs of all roles with transfer permission' do
        expect(Role.names_and_ids_by_transfer).to include(
          ['Transfer Role', 'role-transfer-role'], ['Referral Transfer Role', 'role-referral-transfer-role']
        )
      end

      it 'does not return Names and IDs of roles that do not have transfer permission' do
        expect(Role.names_and_ids_by_transfer).not_to include(
          ['Referral Role', 'role-referral-role'], ['Neither Role', 'role-neither-role']
        )
      end
    end
  end

  describe 'associate_all_forms' do
    before do
      clean_data(Role, Field, FormSection, PrimeroModule, PrimeroProgram)
      @form_section_a = FormSection.create!(unique_id: 'A', name: 'A', parent_form: 'case', form_group_id: 'm')
      @form_section_b = FormSection.create!(unique_id: 'B', name: 'B', parent_form: 'case', form_group_id: 'x')
      @form_section_child =
        FormSection.create!(unique_id: 'child', name: 'child_form', is_nested: true, parent_form: 'case')
      @field_subform = Field.create!(
        name: 'field_subform', display_name: 'child_form', type: Field::SUBFORM, subform: @form_section_child
      )

      role_case_permissions = [Permission.new(resource: Permission::CASE, actions: [Permission::READ])]
      @role = Role.create!(name: 'Role', permissions: role_case_permissions)
    end
    context 'when the role has permission to case' do
      it 'should associate all the forms_sections to the role' do
        @role.associate_all_forms
        @role.reload
        @role.form_sections.size.should eql 2
        expect(@role.form_sections.to_a).to match_array [@form_section_a, @form_section_b]
      end
    end
    context 'when the form_section has subform' do
      it 'should associate the parent forms_sections only' do
        @form_section_c =
          FormSection.create!(unique_id: 'parent', name: 'parent_form', parent_form: 'case', fields: [@field_subform])
        @role.associate_all_forms
        @role.reload
        @role.form_sections.size.should eql 3
        expect(@role.form_sections).to match_array [@form_section_a, @form_section_b, @form_section_c]
      end
      it 'Reject forms from another primero-module with the associate_all_forms method' do
        primero_module = create(
          :primero_module, name: 'CP', description: 'Child Protection', associated_record_types: ['case']
        )
        @form_section_c = FormSection.create!(
          unique_id: 'parent', name: 'parent_form', parent_form: 'case', fields: [@field_subform],
          primero_modules: [primero_module]
        )
        @role.associate_all_forms
        @role.reload
        @role.form_sections.size.should eql 2
        expect(@role.form_sections).to match_array [@form_section_a, @form_section_b]
      end
    end
    context 'form from another primero-module' do
      before do
        clean_data(PrimeroModule, PrimeroProgram, Role)
        @primero_module = create(
          :primero_module, name: 'CP', description: 'Child Protection', associated_record_types: ['case']
        )
        @primero_module_gbv = create(
          :primero_module, name: 'GBV', description: 'gbv', associated_record_types: ['case']
        )
        @form_section_c = FormSection.create!(
          unique_id: 'C', name: 'C', parent_form: 'case', form_group_id: 'x', primero_modules: [@primero_module_gbv]
        )
      end
      it 'When save, reject forms from another primero-module' do
        role = create(:role, modules: [@primero_module], form_sections: [@form_section_c])
        expect(role.form_sections).to eq([])
      end
      it "When save, eject forms from any primero-module if the role doesn't have primero-module" do
        role = create(:role, modules: [], form_sections: [@form_section_c])
        expect(role.form_sections).to eq([])
      end
      it 'When update, reject forms from another primero-module' do
        role = create(:role, modules: [@primero_module])
        role.update(form_sections: [@form_section_c])
        expect(role.form_sections).to eq([])
      end
      it "When update, reject forms from any primero-module if the role doesn't have primero-module" do
        role = create(:role, modules: [])
        role.update(form_sections: [@form_section_c])
        expect(role.form_sections).to eq([])
      end
      after do
        clean_data(PrimeroModule, PrimeroProgram, Role)
      end
    end
  end

  describe '#update_properties' do
    before :each do
      clean_data(Field, FormSection, Role, PrimeroProgram, PrimeroModule)
      @program = PrimeroProgram.create!(
        unique_id: 'primeroprogram-primero',
        name: 'Primero',
        description: 'Default Primero Program'
      )
      @form_section_a = FormSection.create!(unique_id: 'A', name: 'A', parent_form: 'case', form_group_id: 'm')
      @module_cp = PrimeroModule.create!(
        unique_id: 'primeromodule-cp-a',
        name: 'CPA',
        description: 'Child Protection A',
        associated_record_types: %w[case tracing_request incident],
        primero_program: @program,
        form_sections: [@form_section_a]
      )
      @permissions_test = [
        Permission.new(
          resource: Permission::ROLE,
          actions: [
            Permission::EXPORT_PDF,
            Permission::CREATE
          ],
          role_unique_ids: %w[
            role-cp-case-worker
            role-cp-manager
          ]
        ),
        Permission.new(
          resource: Permission::USER,
          actions: [
            Permission::READ,
            Permission::WRITE,
            Permission::CREATE
          ]
        )
      ]
      Role.create(
        unique_id: 'role_test_01',
        name: 'name_test_01',
        description: 'description_test_01',
        group_permission: 'all',
        referral: false,
        transfer: false,
        is_manager: true,
        permissions: @permissions_test,
        form_sections: [@form_section_a],
        modules: [@module_cp]
      )
    end
    let(:full_properties) do
      {
        name: 'CP Administrator 00',
        description: 'updating full attributes',
        group_permission: 'all',
        referral: false,
        transfer: false,
        is_manager: true,
        form_section_unique_ids: %w[C],
        module_unique_ids: [@module_cp.unique_id],
        permissions: {
          agency: %w[
            read
            delete
          ],
          role: %w[
            delete
            read
          ],
          objects: {
            agency: %w[
              test_update_agency_00
              test_update_agency_01
            ],
            role: %w[
              test_update_role_01
              test_update_role_02
            ]
          }
        }
      }
    end
    let(:properties_without_permission) do
      {
        name: 'CP Administrator 01',
        description: 'no updating permission',
        group_permission: 'all',
        referral: false,
        transfer: false,
        is_manager: true,
        form_section_unique_ids: %w[C],
        module_unique_ids: [@module_cp.unique_id]
      }
    end
    let(:properties_without_module) do
      {
        name: 'CP Administrator 02',
        description: 'no updating module',
        group_permission: 'all',
        referral: false,
        transfer: false,
        is_manager: true,
        form_section_unique_ids: %w[C]
      }
    end
    let(:properties_without_forms) do
      {
        name: 'CP Administrator 03',
        description: 'no updating forms',
        group_permission: 'all',
        referral: false,
        transfer: false,
        is_manager: true
      }
    end
    subject { Role.last }

    context 'when update all attributes' do
      before do
        subject.update_properties(full_properties)
        subject.save
      end

      it 'should update the role' do
        expect(subject.name).to eq('CP Administrator 00')
        expect(subject.description).to eq('updating full attributes')
      end
    end

    context 'when update attributes but not permission' do
      before do
        subject.update_properties(properties_without_permission)
        subject.save
      end

      it 'should update the role' do
        expect(subject.name).to eq('CP Administrator 01')
        expect(subject.description).to eq('no updating permission')
        expect(subject.permissions.size).to eq(2)
      end
    end

    context 'when update attributes but not module' do
      before do
        subject.update_properties(properties_without_module)
        subject.save
      end

      it 'should update the role' do
        expect(subject.name).to eq('CP Administrator 02')
        expect(subject.description).to eq('no updating module')
        expect(subject.modules).to eq([@module_cp])
      end
    end

    context 'when update attributes but not forms' do
      before do
        subject.update_properties(properties_without_forms)
        subject.save
      end

      it 'should update the role' do
        expect(subject.name).to eq('CP Administrator 03')
        expect(subject.description).to eq('no updating forms')
        expect(subject.form_sections).to eq([@form_section_a])
      end
    end
  end
end
