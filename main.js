const Validator = (options) => {
	const formElement = document.querySelector(options.form);
	if (!formElement) return;

	const selectorRules = {};

	const validate = (inputElement, rule) => {
		const formGroupElement = inputElement.closest(
			options.formGroupSelector,
		);
		const messageElement = formGroupElement.querySelector(
			options.messageSelector,
		);
		let message;

		/**
		 * Validate multiple rules
		 */
		const testRules = selectorRules[rule.selector];
		for (let i = 0; i < testRules.length; i++) {
			switch (inputElement.type) {
				case 'checkbox':
				case 'radio':
					message = testRules[i](
						formElement.querySelector(`${rule.selector}:checked`)
							?.value,
					);
					break;
				default:
					message = testRules[i](inputElement.value);
			}
			if (message) break;
		}
		/**
		 * Show / hide message
		 */
		if (message) {
			messageElement.innerText = message;
			formGroupElement.classList.add('invalid');
		} else {
			messageElement.innerText = '';
			formGroupElement.classList.remove('invalid');
		}

		return !message;
	};

	options.rules.forEach((rule) => {
		const inputElements = formElement.querySelectorAll(rule.selector);
		if (!inputElements) return;

		/**
		 * Handle add multiple rules
		 */
		selectorRules[rule.selector]
			? selectorRules[rule.selector].push(rule.test)
			: (selectorRules[rule.selector] = [rule.test]);

		/**
		 * Handle input's events
		 */
		inputElements.forEach((inputElement) => {
			const formGroupElement = inputElement.closest(
				options.formGroupSelector,
			);
			const messageElement = formGroupElement.querySelector(
				options.messageSelector,
			);
			inputElement.onblur = () => {
				validate(inputElement, rule);
			};
			inputElement.oninput = () => {
				formGroupElement.classList.remove('invalid');
				messageElement.innerText = '';
			};
		});
	});

	/**
	 * Handle form's submit event
	 */
	formElement.onsubmit = (e) => {
		e.preventDefault();

		let isValidForm = true;
		options.rules.forEach((rule) => {
			const inputElement = formElement.querySelector(rule.selector);
			const isValid = validate(inputElement, rule);
			if (!isValid) isValidForm = false;
		});
		if (!isValidForm) return;

		/**
		 * Get form data and return to callback
		 */
		if (typeof options.onSubmit === 'function') {
			const enableInputs = formElement.querySelectorAll(
				'[name]:not([disabled])',
			);
			const formData = Array.from(enableInputs).reduce((value, input) => {
				switch (input.type) {
					case 'radio':
						if (value[input.name]) break;
						const checkedRadioElement = formElement.querySelector(
							`input[name='${input.name}']:checked`,
						);
						value[input.name] = checkedRadioElement
							? checkedRadioElement.value
							: '';
						break;
					case 'checkbox':
						if (value[input.name]) break;
						value[input.name] = [];
						const checkedCheckboxElements =
							formElement.querySelectorAll(
								`input[name='${input.name}']:checked`,
							);
						checkedCheckboxElements.forEach((checkboxElement) => {
							value[input.name].push(checkboxElement.value);
						});
						break;
					case 'file':
						value[input.name] = input.files;
						break;
					default:
						value[input.name] = input.value;
				}
				return value;
			}, {});
			options.onSubmit(formData);
		} else {
			/**
			 * Fire default event
			 */
			formElement.submit();
		}
	};
};

Validator.isRequired = (selector, msg) => {
	return {
		selector,
		test(value) {
			return (typeof value === 'string' ? value.trim() : value)
				? undefined
				: msg || 'This field is required.';
		},
	};
};
Validator.isEmail = (selector, msg) => {
	return {
		selector,
		test(value) {
			const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			return regex.test(value)
				? undefined
				: msg || 'Please enter a valid email address.';
		},
	};
};
Validator.minLength = (selector, length, msg) => {
	return {
		selector,
		test(value) {
			return value.length >= length
				? undefined
				: msg || `Please use at least ${length} characters`;
		},
	};
};
Validator.isConfirmed = (selector, confirmTargetSelector, msg) => {
	return {
		selector,
		test(value) {
			return value === document.querySelector(confirmTargetSelector).value
				? undefined
				: msg || "Confirmation don't match";
		},
	};
};

/**
 * Validate form
 */
Validator({
	form: '#form',
	formGroupSelector: '.form-group',
	messageSelector: '.error-message',
	rules: [
		Validator.isRequired('#username'),
		Validator.isEmail('#email'),
		Validator.minLength('#password', 6),
		Validator.isConfirmed('#confirm-password', '#password'),
		Validator.isRequired('#avatar'),
		Validator.isRequired('#select'),
		Validator.isRequired('input[name="gender"]'),
		Validator.isRequired('input[name="color"]'),
	],
	onSubmit(data) {
		console.log(data);
	},
});
