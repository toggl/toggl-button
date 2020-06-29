import * as React from 'react';
import styled from '@emotion/styled';

import * as text from '../@toggl/style/lib/text';

function Summary ({
  totals
}: {
  totals: {
    today: string,
    week: string
  }
}) {
  return (
    <SummaryRow>
      <div>Today: {totals.today}</div>
      <div>This week: {totals.week}</div>
    </SummaryRow>
  )
}

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;

  color: var(--font-color);
  font-weight: ${text.bold};
  font-size: 12px;
`;

export default Summary;
