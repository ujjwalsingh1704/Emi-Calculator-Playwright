Feature: EMI calculator
  Scenario Outline: Calculate a home loan and render the payment chart
    Given I open the EMI calculator
    Then the calculator dashboard should be visible
    When I select the "Home Loan" tab
    And I set loan amount to <amount> lakhs, interest rate to <rate> percent, and tenure to <years> years
    Then the monthly EMI should equal the independently calculated amount
    And every repayment summary figure should match the independent calculation
    And the pie chart should be visible with positive principal and interest values
    And the schedule should have one row per payment

    Examples:
      | amount | rate | years |
      | 25     | 10   | 10    |
      | 50     | 7.5  | 15    |

  Scenario: Personal loan bar chart exposes schedule values
    Given I open the EMI calculator
    Then the calculator dashboard should be visible
    When I select the "Personal Loan" tab
    Then every repayment summary figure should match the independent calculation
    And the schedule should have one row per payment
    Then the EMI bar chart should be visible and contain data bars
    And the first bar tooltip should match the calculated remaining balance
    And the first installment figures should match independent calculations
    When I set the payment schedule start month to "2026-12"
    Then the payment schedule start month should be "2026-12"
    And the first schedule payment date should be "Dec 2026"
