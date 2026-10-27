@self-heal
Feature: Locator self-healing exercise
  # Deliberately broken examples. Keep excluded from the standard run until an AI locator review is applied and validated.
  Scenario: Broken positional locator for loan amount
    Given I open the EMI calculator
    When I set loan amount using the legacy nth child locator
    Then the legacy selector should locate the loan amount slider

  Scenario: Broken old label for interest rate
    Given I open the EMI calculator
    When I set interest using the obsolete label
    Then the legacy selector should locate the interest rate slider

  Scenario: Broken old chart selector
    Given I open the EMI calculator
    Then the legacy selector should locate the historical chart container
