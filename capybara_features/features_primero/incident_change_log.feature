#JIRA PRIMERO-338
#JIRA PRIMERO-524
#JIRA PRIMERO-652

@javascript @primero @search
Feature: Incident change log
  Test weather each incident has a proper change log attached to it.

  @javascript @primero
  Scenario: Validate incident creating and initial setting of field
    Given I am logged in as an admin with username "primero_mrm" and password "primero"
    And the following incidents exist in the system:
      | created_by  | date_of_first_report    | status   | unique_identifier                    |
      | primero_mrm | 03-Feb-2004             | active   | 21c4cba8-b410-4af6-b349-68c557af3aa9 |
    When I press the "INCIDENTS" button
    And I press the "7af3aa9" link
    When I press the "Change Log" link
    Then I should see change log of creation by user "primero_mrm"
    And I press the "Edit" button
    And I press the "Record Owner" button
    And I fill in "Field/Case/Social Worker" with "Bob"
    And I press "Save"
    And I press the "Change Log" link
    And I should see change log for initially setting the field "Caseworker name" to value "Bob" by "primero_mrm"

  @javascript @primero
  Scenario: Access the Change Log Feature From Case Page
    Given I am logged in as an admin with username "primero_mrm" and password "primero"
    And the following incidents exist in the system:
      | created_by  | date_of_first_report    | status   | unique_identifier                    |
      | primero_mrm     | 03-Feb-2004             | active   | 21c4cba8-b410-4af6-b349-68c557af3aa9 |
    When I press the "INCIDENTS" button
    And I press the "7af3aa9" link
    Then I should see a "Change Log" link on the page

  @javascript @primero
  Scenario: Access the Change Log Feature
    Given I am logged in as an admin with username "primero_mrm" and password "primero"
    And the following incidents exist in the system:
      | created_by  | date_of_first_report    | status   | unique_identifier                    |
      | primero_mrm     | 03-Feb-2004             | active   | 21c4cba8-b410-4af6-b349-68c557af3aa9 |
    When I press the "INCIDENTS" button
    And I press the "7af3aa9" link
    And I press the "Edit" button
    Then I should see a "Change Log" link on the page

  @javascript @primero
  Scenario Outline: Change log is in the correct order
    Given I am logged in as an admin with username "primero_mrm" and password "primero"
    And the following incidents exist in the system:
      | created_by  | date_of_first_report    | status   | unique_identifier                    |
      | primero_mrm     | 03-Feb-2004             | active   | 21c4cba8-b410-4af6-b349-68c557af3aa9 |
    When I press the "INCIDENTS" button
    And I press the "7af3aa9" link
    And I press the "Edit" button
    And I press the "Record Owner" button
    And I fill in "Field/Case/Social Worker" with "Bob"
    And I press "Save"
    And I press the "Change Log" link
    Then I see the list is in order with this <item>
    Examples:
    | item                                            |
    | Caseworker name initially set to Bob by primero_mrm belonging to N/A |
    | Record created by primero_mrm belonging to N/A          |