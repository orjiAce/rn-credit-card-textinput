import React from 'react';
import TestRenderer, { act, ReactTestInstance } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import CardNumberTextInput from '../src/CardNumberInput';

describe('CardNumberTextInput characterization', () => {
  it('renders the existing label, placeholder, icon, and native defaults', () => {
    const tree = TestRenderer.create(
      <CardNumberTextInput
        label="card number"
        placeholder="0000 0000 0000 0000"
        defaultValue="4111"
        updateTextVal={() => undefined}
      />,
    );

    expect(
      tree.root.findAll((node) => String(node.type) === 'Text')[0].children,
    ).toContain('card number');
    expect(findHost(tree.root, 'TextInput').props).toMatchObject({
      placeholder: '0000 0000 0000 0000',
      keyboardType: 'number-pad',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
      defaultValue: '4111',
    });
    expect(String(findHost(tree.root, 'Image').props.source)).toContain(
      'credit-card.png',
    );
  });

  it('formats changes through updateTextVal', () => {
    const updateTextVal = vi.fn();
    const tree = TestRenderer.create(
      <CardNumberTextInput updateTextVal={updateTextVal} />,
    );

    act(() => findHost(tree.root, 'TextInput').props.onChangeText('41111111'));
    expect(updateTextVal).toHaveBeenCalledWith('4111 1111 ');
  });

  it('renders the current validator error after partial input', () => {
    const tree = TestRenderer.create(
      <CardNumberTextInput updateTextVal={() => undefined} />,
    );

    act(() => findHost(tree.root, 'TextInput').props.onChangeText('4111'));
    expect(
      tree.root
        .findAll((node) => String(node.type) === 'Text')
        .some((node) =>
          node.children.includes('Credit card number is in invalid format'),
        ),
    ).toBe(true);
  });

  it.each([
    ['4111111111111111', 'visa.png'],
    ['5555555555554444', 'mastercard.png'],
    ['378282246310005', 'american-express.png'],
    ['6011111111111117', 'discover.png'],
    ['501800000000007', 'maestro.png'],
    ['633400000000000004', 'solo-card.png'],
  ])('shows the existing icon for %s', (number, icon) => {
    const tree = TestRenderer.create(
      <CardNumberTextInput updateTextVal={() => undefined} />,
    );

    act(() => findHost(tree.root, 'TextInput').props.onChangeText(number));
    expect(String(findHost(tree.root, 'Image').props.source)).toContain(icon);
  });

  it.each([
    '38520000023237',
    '30000000000004',
    '3530111333300000',
    '201400000000009',
    '5641820000000005',
    '67060000000000006',
  ])(
    'keeps the generic icon for supported brand %s without a dedicated asset',
    (number) => {
      const tree = TestRenderer.create(
        <CardNumberTextInput updateTextVal={() => undefined} />,
      );
      act(() => findHost(tree.root, 'TextInput').props.onChangeText(number));
      expect(String(findHost(tree.root, 'Image').props.source)).toContain(
        'credit-card.png',
      );
    },
  );

  it('only renders a supplied external error after touched', () => {
    const untouched = TestRenderer.create(
      <CardNumberTextInput
        error="required"
        touched={false}
        updateTextVal={() => undefined}
      />,
    );
    const touched = TestRenderer.create(
      <CardNumberTextInput
        error="required"
        touched
        updateTextVal={() => undefined}
      />,
    );

    expect(JSON.stringify(untouched.toJSON())).not.toContain('required');
    expect(JSON.stringify(touched.toJSON())).toContain('required');
  });

  it('documents that value is currently swallowed instead of reaching TextInput', () => {
    const tree = TestRenderer.create(
      <CardNumberTextInput
        value="4111 1111 1111 1111"
        updateTextVal={() => undefined}
      />,
    );

    expect(findHost(tree.root, 'TextInput').props.value).toBeUndefined();
  });

  it('keeps custom container, wrapper, label, and input style hooks', () => {
    const tree = TestRenderer.create(
      <CardNumberTextInput
        cardInputContainerStyle={{ opacity: 0.9 }}
        inputWrapStyle={{ borderRadius: 4 }}
        labelStyle={{ fontWeight: 'bold' }}
        inputStyle={{ color: 'navy' }}
        updateTextVal={() => undefined}
      />,
    );
    const rendered = tree.toJSON();
    expect(JSON.stringify(rendered)).toContain('opacity');
    expect(JSON.stringify(rendered)).toContain('borderRadius');
    expect(JSON.stringify(rendered)).toContain('fontWeight');
    expect(JSON.stringify(rendered)).toContain('navy');
  });
});

it('keeps corrected validation stable across input changes and re-renders', () => {
  const updateTextVal = vi.fn();
  const tree = TestRenderer.create(
    <CardNumberTextInput updateTextVal={updateTextVal} />,
  );
  const visaWithAmExLength = '400000000000006';
  act(() =>
    findHost(tree.root, 'TextInput').props.onChangeText(visaWithAmExLength),
  );
  const assertRejected = () => {
    expect(String(findHost(tree.root, 'Image').props.source)).toContain(
      'credit-card.png',
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Credit card number has an inappropriate number of digits',
    );
  };
  assertRejected();
  act(() =>
    findHost(tree.root, 'TextInput').props.onChangeText('5555555555554444'),
  );
  act(() =>
    tree.update(
      <CardNumberTextInput label="changed" updateTextVal={updateTextVal} />,
    ),
  );
  act(() =>
    findHost(tree.root, 'TextInput').props.onChangeText(visaWithAmExLength),
  );
  assertRejected();
  expect(updateTextVal).toHaveBeenLastCalledWith('4000 0000 0000 006');
});

function findHost(root: ReactTestInstance, type: string): ReactTestInstance {
  return root.find((node) => node.type === type);
}
