const form = document.getElementById('surveyForm');
const submitButton = document.getElementById('submitButton');
const formMessage = document.getElementById('formMessage');
const q4Count = document.getElementById('q4Count');
const toast = document.getElementById('toast');
const q4Inputs = Array.from(document.querySelectorAll('input[name="q4"]'));
const requiredNames = Array.from({ length: 17 }, (_, index) => `q${index + 1}`);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function getSelectedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function validateForm() {
  const selectedQ4 = getSelectedValues('q4');
  q4Count.textContent = selectedQ4.length;

  q4Inputs.forEach((input) => {
    input.disabled = selectedQ4.length >= 2 && !input.checked;
  });

  const allAnswered = requiredNames.every((name) => {
    const selected = getSelectedValues(name);
    return name === 'q4' ? selected.length === 2 : selected.length === 1;
  });

  submitButton.disabled = !allAnswered;
  formMessage.textContent = allAnswered ? '' : '请完整填写所有题目，第4题需选择2项。';
  formMessage.classList.toggle('error', !allAnswered);

  return allAnswered;
}

function collectFormData() {
  const data = {};
  requiredNames.forEach((name) => {
    const selected = getSelectedValues(name);
    data[name] = name === 'q4' ? selected : selected[0];
  });
  return data;
}

form.addEventListener('change', validateForm);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast('请先填写完整问卷');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = '提交中...';

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(collectFormData())
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || '提交失败');
    }

    form.reset();
    q4Inputs.forEach((input) => {
      input.disabled = false;
    });
    validateForm();
    showToast('提交成功');
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add('error');
    showToast(error.message);
  } finally {
    submitButton.textContent = '提交问卷';
    validateForm();
  }
});

validateForm();
