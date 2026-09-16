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

  it('shows the Mastercard icon after a valid Mastercard number', () => {
    const tree = TestRenderer.create(
      <CardNumberTextInput updateTextVal={() => undefined} />,
    );

    act(() =>
      findHost(tree.root, 'TextInput').props.onChangeText('5555555555554444'),
    );
    expect(String(findHost(tree.root, 'Image').props.source)).toContain(
      'mastercard.png',
    );
  });

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

function findHost(root: ReactTestInstance, type: string): ReactTestInstance {
  return root.find((node) => node.type === type);
}
