import { render } from '@testing-library/react';

import FeaturesPayments from './features-payments';

describe('FeaturesPayments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeaturesPayments />);
    expect(baseElement).toBeTruthy();
  });
});
