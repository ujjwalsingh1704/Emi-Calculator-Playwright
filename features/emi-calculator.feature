Feature: EMI calculator
  Scenario Outline: Calculate a home loan and render the payment chart
    Given I open the EMI calculator
    When I select the "Home Loan" tab
    And I set loan amount to <amount> lakhs, interest rate to <rate> percent, and tenure to <years> years
    Then the monthly EMI should equal the independently calculated amount
    And the pie chart should be visible with positive principal and interest values

    Examples:
      | amount | rate | years |
      | 25     | 10   | 10    |
      | 50     | 7.5  | 15    |

  Scenario: Personal loan bar chart exposes schedule values
    Given I open the EMI calculator
    When I select the "Personal Loan" tab
    Then the EMI bar chart should be visible and contain data bars
    When I set the payment schedule start month to "2026-12"
    Then the payment schedule start month should be "2026-12"
