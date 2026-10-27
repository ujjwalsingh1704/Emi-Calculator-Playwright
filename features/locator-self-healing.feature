@self-heal
Feature: Repaired semantic locators
  Scenario: Update the loan amount using its accessible slider
    Given I open the EMI calculator
    When I set the "Loan Amount" slider to 30
    Then the "Loan Amount" slider should have value "30"

  Scenario: Update the interest rate using its accessible slider
    Given I open the EMI calculator
    When I set the "Interest Rate" slider to 9
    Then the "Interest Rate" slider should have value "9"

  Scenario: Locate the balance chart by its accessible name
    Given I open the EMI calculator
    Then the balance chart should be visible by its accessible name
