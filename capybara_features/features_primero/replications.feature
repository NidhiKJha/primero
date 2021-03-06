# JIRA PRIMERO-382

@javascript @primero
Feature: Replications

  Background:
    Given I am logged in as an admin with username "primero" and password "primero"
    When I access "replications page"

  Scenario: Add, edit and delete replication
    And I should see "Configure a Server"

    When I follow "Configure a Server"
    Then I should see "Add a Remote Server"
    And I fill in "Description" with "Test Replication"
    And I fill in "Primero URL" with "http://localhost:99999"
    And I fill in "User Name" with "primero"
    And I fill in "Password" with "primero"
    And I make sure that the Replication Configuration request fails
    And I click the "Save" button

    Then I should see "Could not connect to the remote server"
    And I make sure that the Replication Configuration request succeeds
    And I fill in "Password" with "primero"
    And I click the "Save" button

    Then I should see "Configure a Server"
    And I should see "Test Replication"
    And I should see "http://localhost:99999"
    And I should see "primero"
    And I should see "In Progress"

    Then I follow "Edit"
    Then I should see "Edit Configuration"
    And I fill in "Description" with "New Replication"
    And I fill in "Primero URL" with "http://localhost:88888"
    And I fill in "User Name" with "primero"
    And I fill in "Password" with "primero"
    And I make sure that the Replication Configuration request succeeds
    And I click the "Save" button

    Then I should see "Configure a Server"
    And I should see "New Replication"
    And I should see "http://localhost:88888"
    And I should not see "Test Replication"
    And I should not see "http://localhost:99999"

    And I follow "Delete"
    And I click OK in the browser popup
    Then I should not see "New Replication"
    And I should not see "http://localhost:88888"
    And I clear the Replication Configuration expectations

  Scenario: Validation messages
    When I follow "Configure a Server"
    Then I should see "Add a Remote Server"
    And I fill in "Description" with ""
    And I fill in "Primero URL" with ""
    And I fill in "User Name" with ""
    And I fill in "Password" with ""
    And I click the "Save" button
    And I should see "Remote app uri can't be blank" on the page
    And I should see "Remote app uri Please enter a valid Primero URL" on the page
    And I should see "Description can't be blank" on the page
    And I should see "Username can't be blank" on the page
    And I should see "Password can't be blank" on the page
    And I should see "Fetch remote config Could not connect to the remote server" on the page
    And I fill in "Description" with "Some description"
    And I fill in "Primero URL" with "Invalid URL"
    And I fill in "User Name" with "username"
    And I fill in "Password" with "password"
    And I click the "Save" button
    And I should see "Remote app uri Please enter a valid Primero URL" on the page
    And I should see "Fetch remote config Could not connect to the remote server" on the page

  #TODO -Implement this when more is known about what we are planning to do with blacklist
  @wip
  Scenario: Should able to blacklist a device
    When I have the following devices:
      | user_name | imei        | blacklisted |
      | bob       | 82828282882 | true        |
      | adam      | 1212121212  | false       |
      | eve       | 1212121212  | false       |
    Then I click blacklist for "1212121212"
    And I wait for the page to load
    Then device "1212121212" should be blacklisted
    Then I click blacklist for "82828282882"
    And I wait for the page to load
    Then device "82828282882" should not be blacklisted
