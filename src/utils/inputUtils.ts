export function setValidationMessage(event: Event): void {
	const input = event.target as HTMLInputElement;
	if (input.value === '') {
		input.setCustomValidity('Please enter a Songsterr URL.');
	} else {
		input.setCustomValidity('Please enter a valid Songsterr URL.');
	}
}
export function clearValidationMessage(event: Event): void {
	const input = event.target as HTMLInputElement;
	input.setCustomValidity('');
}
