export function formatPrice (value) {
  const amount = (value / 100).toFixed(2);

  return parseFloat(amount).toLocaleString('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function priceWithoutVat (value, rate = 25) {
  return (value / (100+rate)) * 100;
}

export function formatCorrectPrice (price) {
  if (!price) {
    return null;
  }
  let negative = false;
  price = price.toString();

  if (price?.includes('-')) {
    negative = true;
  }

  price = price?.replace(/[^0-9.,]/g, '');

  if (!price) {
    return null;
  }

  if (price.includes(',') && price.includes('.')) {
    // Replace comma with x and decimal with y
    price = price.replace(/,/g, 'x');
    price = price.replace(/\./g, 'y');

    // Take all the x and y out and check if there is equal length of them
    let firstNonLetter = price.replace(/[0-9]/g, '')[0];
    let secondNonLetter = price.replace(/[0-9]/g, '').replace(firstNonLetter, '')[0];

    price = price.replace(firstNonLetter, '');
    price = price.replace(secondNonLetter, '.');

    // Check if there are 2 letters after the .
    if (price.split('.')[1]?.length < 2) {
        // Add zero to the end
        price = price + '0';
    }

    price = parseInt(price.replace(/\./g, ''));
  } else if (price.includes(',') || price.includes('.')) {
    // Find out if it's a comma or dot it contains
    let comma = price.includes(',') ? ',' : '.';

    if (price.split(comma)[1].length < 2) {
        // Add zero to the end
        price = price + '0';
    }

    price = parseInt(price.replace(comma, ''));
  } else {
      price = parseInt(price) * 100;
  }

  return negative ? price * -1 : price;
}
