//Country of choice South Africa

const displayCurrentData = (country, date, active, recovered, confirmed, deaths) => {
  let countryElem = document.getElementsByClassName('country');
  let dateElem = document.getElementById('date');
  let activeElem = document.getElementById('active');
  let recoveredElem = document.getElementById('recovered');
  let confirmedElem = document.getElementById('confirmed');
  let deathsElem = document.getElementById('deaths');

  dateElem.innerHTML = date.substring(0,10);
  activeElem.innerHTML = active;
  recoveredElem.innerHTML = recovered;
  confirmedElem.innerHTML = confirmed;
  deathsElem.innerHTML = deaths;

  for(let i = 0; i < countryElem.length; i++){
    countryElem[i].innerHTML = country;
  }

}

const displayPredictedData = ( date, active, recovered, confirmed, deaths) => {
  let datePredElem = document.getElementById('datePred');
  let activePredElem = document.getElementById('activePred');
  let recoveredPredElem = document.getElementById('recoveredPred');
  let confirmedPredElem = document.getElementById('confirmedPred');
  let deathsPredElem = document.getElementById('deathsPred');

  datePredElem.innerHTML = date;
  activePredElem.innerHTML = active;
  recoveredPredElem.innerHTML = recovered;
  confirmedPredElem.innerHTML = confirmed;
  deathsPredElem.innerHTML = deaths;
}

function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  
  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor

    const inputTensor = tf.tensor2d(data, [data.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));

    return {
      inputs: normalizedInputs,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
    }
  });  
}


const predictOutcomes = async (date, activeArr, recoveredArr, confirmedArr, deathsArr) => {

  let predActive;
  let predRecovered;
  let predConfirmed;
  let predDeaths;
  
  let predDate = new Date(date); 
  predDate.setFullYear(predDate.getFullYear() + 1);
  let formattedDate = predDate.toLocaleDateString('en-CA');
  
  let lastThreeActive = [];
  lastThreeActive.push(activeArr[activeArr.length-1]);
  lastThreeActive.push(activeArr[activeArr.length-2]);
  lastThreeActive.push(activeArr[activeArr.length-3]);

  let activeMin = Math.min( ...lastThreeActive );
  let activeMax = Math.max( ...lastThreeActive );
  let activeDiff = activeMax - activeMin;
  let totalActive = activeDiff/3;

  predActive = Math.floor(totalActive * 365) + activeArr[activeArr.length-1];

  let lastThreeRecovered = [];
  lastThreeRecovered.push(recoveredArr[recoveredArr.length-1]);
  lastThreeRecovered.push(recoveredArr[recoveredArr.length-2]);
  lastThreeRecovered.push(recoveredArr[recoveredArr.length-3]);

  let recoveredMin = Math.min( ...lastThreeRecovered );
  let recoveredMax = Math.max( ...lastThreeRecovered );
  let recoveredDiff = recoveredMax - recoveredMin;
  let totalRecovered = recoveredDiff/3;

  predRecovered = Math.floor(totalRecovered * 365) + recoveredArr[recoveredArr.length-1];

  let lastThreeConfirmed = [];
  lastThreeConfirmed.push(confirmedArr[confirmedArr.length-1]);
  lastThreeConfirmed.push(confirmedArr[confirmedArr.length-2]);
  lastThreeConfirmed.push(confirmedArr[confirmedArr.length-3]);

  let confirmedMin = Math.min( ...lastThreeConfirmed );
  let confirmedMax = Math.max( ...lastThreeConfirmed );
  let confirmedDiff = confirmedMax - confirmedMin;
  let totalConfirmed = confirmedDiff/3;

  predConfirmed = Math.floor(totalConfirmed * 365) + confirmedArr[confirmedArr.length-1];

  let lastThreeDeaths = [];
  lastThreeDeaths.push(deathsArr[deathsArr.length-1]);
  lastThreeDeaths.push(deathsArr[deathsArr.length-2]);
  lastThreeDeaths.push(deathsArr[deathsArr.length-3]);

  let deathsMin = Math.min( ...lastThreeDeaths );
  let deathsMax = Math.max( ...lastThreeDeaths );
  let deathsDiff = deathsMax - deathsMin;
  let totalDeaths = deathsDiff/3;

  predDeaths = Math.floor(totalDeaths * 365) + deathsArr[deathsArr.length-1];

  
  displayPredictedData(formattedDate, predActive,predRecovered,predConfirmed,predDeaths)

}

const extractCurrentData = (req) => {
  let country;
  let date;
  let active;
  let recovered;
  let confirmed;
  let deaths;
  let lastDate;
  let activeArr = [];
  let recoveredArr = [];
  let confirmedArr = [];
  let deathsArr = [];


  req.map( (entry,i,array) => {
    country = entry.Country;
    date= entry.Date;
    active = entry.Active;
    recovered = entry.Recovered;
    confirmed = entry.Confirmed;
    deaths = entry.Deaths;

    activeArr.push(active);
    recoveredArr.push(recovered);
    confirmedArr.push(confirmed);
    deathsArr.push(deaths);

    if (i === array.length -1){
      lastDate = date;

      displayCurrentData(country, date, active, recovered, confirmed, deaths);
    }
  })

  predictOutcomes(date, activeArr, recoveredArr, confirmedArr,deathsArr);

} 

const fetchData = async () => {
  const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    
    await fetch("https://api.covid19api.com/total/country/south-africa", requestOptions)
      .then(response => response.json())
      .then(result => extractCurrentData(result))
      .catch(error => console.log('error', error));
}

fetchData()