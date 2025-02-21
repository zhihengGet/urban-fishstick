// eslint-disable

/** @type {(inputs: { username: NonNullable<unknown> }) => string} */
export const example_message = (i) => {
	return `Hello world ${i.username}`
};