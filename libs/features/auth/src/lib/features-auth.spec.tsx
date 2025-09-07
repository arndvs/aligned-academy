import { render } from '@testing-library/react';

import FeaturesAuth from './features-auth';

describe('FeaturesAuth', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeaturesAuth />);
    expect(baseElement).toBeTruthy();
  });
});
