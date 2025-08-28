function prototypeApp() {
  return {
    // ===== Basic Configuration =====
    steps: ['Home', 'Basic Information', 'Property Internal Structure', 'Budget', 'Finance', 'Detailed Information'],
    currentStep: 0,
    questionIndex: 0,
    epcIndex: 0,
    previousStep: null, // Record the step before entering step 10

    // ===== Step 1: Basic Information Options =====
    regionOptions: ['Scotland', 'England', 'Wales', 'Northern Ireland'],
    propertyTypeOptions: [
      'Detached House',
      'Semi-Detached House',
      'Terraced House',
      'Apartment/Flat',
      'Maisonette',
      'Bungalow',
      'Cottage',
      'Townhouse',
      'Other'
    ],
    ageOptions: [
      'Before 1900',
      '1900 to 1929',
      '1930 to 1949',
      '1950 to 1966',
      '1967 to 1975',
      '1976 to 1982',
      '1983 to 1990',
      '1991 to 1995',
      '1996 to 2002',
      '2003 to 2006',
      '2007 to 2011',
      '2012 or newer',
      "I don't know"
    ],
    areaOptions: [
      '< 50 m²',
      '50-69 m²',
      '70–89 m²',
      '90–109 m²',
      '110–149 m²',
      '150-199 m²',
      '≥ 200m²'
    ],

    // ===== Step 2: EPC Options =====
    wallOptions: [
      'Solid walls',
      'Cavity walls',
      'Timber frame',
      'Insulated walls',
      "I don't know"
    ],
    windowOptions: [
      'Single glazing',
      'Double glazing',
      'Triple glazing',
      "I don't know"
    ],
    roofOptions: [
      'No loft insulation',
      'Insulation thickness <100mm',
      'Insulation thickness >=270mm',
      "I don't know"
    ],
    floorOptions: [
      'Uninsulated Solid Floor',
      'Insulated Solid Floor',
      'Uninsulated Suspended Floor',
      'Insulated Suspended Floor',
      "I don't know"
    ],

    // ===== Form Data Structure =====
    form: {
      // Step 1: Basic Information
      region: '',
      propertyType: '',
      age: '',
      area: '',
      // Step 2: EPC Information
      wallType: '',
      windowType: '',
      roofType: '',
      floorType: '',
      // Step 4: Income cover choice
      coverChoice: '',
      // Step 5: Service willingness
      detailChoice: '',
      // Step 6: Financing options
      financeChoice: [],
      // Step 7-9: Detail choices
      loanDetail: '',
      welfareDetail: '',
      loanWelfareDetail: '',
      // Step 10: Detailed information confirmation
      detailConfirmed: false,
      // Step 3: Improvement measures multiple choice
      improvementSelected: []
    },

    // ===== Core Navigation Methods =====
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep === 10) {
        // Step 10 returns to the previously recorded step
        if (this.previousStep !== null) {
          this.currentStep = this.previousStep;
          this.previousStep = null; // Clear record
        } else {
          // If no record, default to step 5
          this.currentStep = 5;
        }
      } else if (this.currentStep === 6) {
        // Step 6 (financing options selection) returns to step 4 (income cover choice)
        this.currentStep = 4;
      } else if (this.currentStep === 7 || this.currentStep === 8 || this.currentStep === 9) {
        // Steps 7, 8, 9 (loan/welfare details) return to step 6 (financing options selection)
        this.currentStep = 6;
      } else if (this.currentStep > 1) {
        // Other steps decrease normally
        this.currentStep--;
      }
    },


    // ===== Progress Bar Methods =====
    getStep1Progress() {
      // Check if each sub-question has an answer
      let arr = [this.form.region, this.form.propertyType, this.form.age, this.form.area];
      let answered = 0;
      for(let i=0;i<=this.questionIndex;i++){
        if(arr[i]) answered++;
      }
      return answered === 0 ? 0 : answered/4*100;
    },
    getStep2Progress() {
      let arr = [this.form.wallType, this.form.windowType, this.form.roofType, this.form.floorType];
      let answered = 0;
      for(let i=0;i<=this.epcIndex;i++){
        if(arr[i]) answered++;
      }
      return answered === 0 ? 0 : answered/4*100;
    },
    getStep3Progress() {
      // Step 3 progress bar fill logic
      // Step 3 is improvement measures display, only fill progress bar to 100% when user selects improvement measures
      if (this.currentStep === 3 && this.form.improvementSelected.length > 0) {
        return 100;
      }
      return 0;
    },
    getStep4Progress() {
      // Step 4 to step 10 progress bar fill logic (handling two branches)
      if (this.form.coverChoice === 'yes') {
        // Branch A: Choose "Yes, I can afford it"
        if (this.currentStep === 4) {
          // At step 4, choosing "yes" shows 50% progress
          return 50;
        } else if (this.currentStep === 5) {
          // At step 5, show progress based on detailChoice
          if (this.form.detailChoice === 'yes') {
            return 100; // Choose "I'd like to know more details", progress 100%
          } else if (this.form.detailChoice === 'no') {
            return 100; // Choose "Not for now", progress 100%
          }
          return 50; // No choice, basic progress 50%
        }
        return 100; // Other cases (steps 6-9), progress 100%
      } else if (this.form.coverChoice === 'no') {
        // Branch B: Choose "Apply for loan or grant"
        let progress = 25; // Basic progress 25% (entering financing options selection)
        
        // If financing options are selected, add 25%
        if (this.form.financeChoice.length > 0) {
          progress += 25;
        }
        
        // If entered loan/welfare/combined interface, add 25%
        if (this.currentStep === 7 || this.currentStep === 8 || this.currentStep === 9) {
          progress += 25;
        }
        
        // If "I'd like to know more details" is selected, add 25%
        if (this.form.loanDetail === 'yes' || this.form.welfareDetail === 'yes' || this.form.loanWelfareDetail === 'yes') {
          progress += 25;
        }
        
        return progress;
      }
      
      return 0;
    },


    // ===== Business Logic Methods =====
    getImprovements() {
      // Read user-selected coefficients
      const region = this.form.region;
      const area = this.form.area;
      const costFactor = this.regionCostFactor[region] || 1;
      const savingFactor = this.regionSavingFactor[region] || 1;
      const areaFactor = this.areaFactor[area] || {min:1, max:1};
      
      // Basic measures and baseline values
      const baseImprovements = [
        { name: 'Energy-efficient lighting', baseCost: 20, baseSaving: 27 },
        { name: 'Heating controls (room thermostats)', baseCost: 400, baseSaving: 29 },
        { name: 'Solar water heating system', baseCost: 3000, baseSaving: 27 },
        { name: 'Solar photovoltaic panels', baseCost: 2800, baseSaving: 360 }
      ];
      const result = [];
      for (const item of baseImprovements) {
        const costMin = Math.round(item.baseCost * costFactor * areaFactor.min);
        const costMax = Math.round(item.baseCost * costFactor * areaFactor.max);
        const savingMin = Math.round(item.baseSaving * savingFactor * areaFactor.min);
        const savingMax = Math.round(item.baseSaving * savingFactor * areaFactor.max);
        result.push({
          name: item.name,
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Internal or external wall insulation (appears as long as 'Insulated walls' is not selected)
      if (this.form.wallType && !this.form.wallType.includes('Insulated walls')) {
        const costMin = Math.round(6000 * costFactor * areaFactor.min);
        const costMax = Math.round(6000 * costFactor * areaFactor.max);
        const savingMin = Math.round(100 * savingFactor * areaFactor.min);
        const savingMax = Math.round(100 * savingFactor * areaFactor.max);
        result.push({
          name: 'Internal or external wall insulation',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Floor insulation (solid floor)
      if (this.form.floorType && this.form.floorType.includes('Uninsulated Solid Floor')) {
        const costMin = Math.round(3000 * costFactor * areaFactor.min);
        const costMax = Math.round(3000 * costFactor * areaFactor.max);
        const savingMin = Math.round(40 * savingFactor * areaFactor.min);
        const savingMax = Math.round(40 * savingFactor * areaFactor.max);
        result.push({
          name: 'Floor insulation (solid floor)',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Floor insulation (suspended floor)
      if (this.form.floorType && this.form.floorType.includes('Uninsulated Suspended Floor')) {
        const costMin = Math.round(2000 * costFactor * areaFactor.min);
        const costMax = Math.round(2000 * costFactor * areaFactor.max);
        const savingMin = Math.round(50 * savingFactor * areaFactor.min);
        const savingMax = Math.round(50 * savingFactor * areaFactor.max);
        result.push({
          name: 'Floor insulation (suspended floor)',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Increase loft insulation to 270mm (for properties that can benefit from loft insulation)
      if (this.form.propertyType && (
        this.form.propertyType.includes('Detached House') ||
        this.form.propertyType.includes('Semi-Detached House') ||
        this.form.propertyType.includes('Terraced House') ||
        this.form.propertyType.includes('Bungalow') ||
        this.form.propertyType.includes('Cottage') ||
        this.form.propertyType.includes('Townhouse')
      )) {
        const costMin = Math.round(800 * costFactor * areaFactor.min);
        const costMax = Math.round(800 * costFactor * areaFactor.max);
        const savingMin = Math.round(30 * savingFactor * areaFactor.min);
        const savingMax = Math.round(30 * savingFactor * areaFactor.max);
        result.push({
          name: 'Increase loft insulation to 270mm',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      
      // External wall insulation (for detached and semi-detached properties)
      if (this.form.propertyType && (
        this.form.propertyType.includes('Detached House') ||
        this.form.propertyType.includes('Semi-Detached House')
      ) && this.form.wallType && !this.form.wallType.includes('Insulated walls')) {
        const costMin = Math.round(8000 * costFactor * areaFactor.min);
        const costMax = Math.round(8000 * costFactor * areaFactor.max);
        const savingMin = Math.round(150 * savingFactor * areaFactor.min);
        const savingMax = Math.round(150 * savingFactor * areaFactor.max);
        result.push({
          name: 'External wall insulation',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      
      // Internal wall insulation (for terraced properties and apartments)
      if (this.form.propertyType && (
        this.form.propertyType.includes('Terraced House') ||
        this.form.propertyType.includes('Apartment/Flat') ||
        this.form.propertyType.includes('Maisonette')
      ) && this.form.wallType && !this.form.wallType.includes('Insulated walls')) {
        const costMin = Math.round(4000 * costFactor * areaFactor.min);
        const costMax = Math.round(4000 * costFactor * areaFactor.max);
        const savingMin = Math.round(80 * savingFactor * areaFactor.min);
        const savingMax = Math.round(80 * savingFactor * areaFactor.max);
        result.push({
          name: 'Internal wall insulation',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Cavity wall insulation (wall type selects cavity walls)
      if (this.form.wallType && this.form.wallType.includes('Cavity walls')) {
        const costMin = Math.round(4000 * costFactor * areaFactor.min);
        const costMax = Math.round(4000 * costFactor * areaFactor.max);
        const savingMin = Math.round(100 * savingFactor * areaFactor.min);
        const savingMax = Math.round(100 * savingFactor * areaFactor.max);
        result.push({
          name: 'Cavity wall insulation',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Double glazing (window type selects single glazing or I don't know)
      if (this.form.windowType && (this.form.windowType.includes('Single glazing') || this.form.windowType.includes("I don't know"))) {
        const costMin = Math.round(3000 * costFactor * areaFactor.min);
        const costMax = Math.round(3000 * costFactor * areaFactor.max);
        const savingMin = Math.round(30 * savingFactor * areaFactor.min);
        const savingMax = Math.round(30 * savingFactor * areaFactor.max);
        result.push({
          name: 'Double glazing',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      // Solar panels (more suitable for detached and semi-detached properties)
      if (this.form.propertyType && (
        this.form.propertyType.includes('Detached House') ||
        this.form.propertyType.includes('Semi-Detached House') ||
        this.form.propertyType.includes('Bungalow')
      )) {
        const costMin = Math.round(4000 * costFactor * areaFactor.min);
        const costMax = Math.round(4000 * costFactor * areaFactor.max);
        const savingMin = Math.round(400 * savingFactor * areaFactor.min);
        const savingMax = Math.round(400 * savingFactor * areaFactor.max);
        result.push({
          name: 'Solar photovoltaic panels (4kW system)',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      
      // Heat pump installation (for properties with gardens/outdoor space)
      if (this.form.propertyType && (
        this.form.propertyType.includes('Detached House') ||
        this.form.propertyType.includes('Semi-Detached House') ||
        this.form.propertyType.includes('Bungalow') ||
        this.form.propertyType.includes('Cottage')
      )) {
        const costMin = Math.round(8000 * costFactor * areaFactor.min);
        const costMax = Math.round(8000 * costFactor * areaFactor.max);
        const savingMin = Math.round(300 * savingFactor * areaFactor.min);
        const savingMax = Math.round(300 * savingFactor * areaFactor.max);
        result.push({
          name: 'Air source heat pump installation',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      
      // Smart heating controls (for all property types)
      if (this.form.propertyType) {
        const costMin = Math.round(200 * costFactor * areaFactor.min);
        const costMax = Math.round(200 * costFactor * areaFactor.max);
        const savingMin = Math.round(25 * savingFactor * areaFactor.min);
        const savingMax = Math.round(25 * savingFactor * areaFactor.max);
        result.push({
          name: 'Smart heating controls and thermostats',
          cost: '£' + costMin + ' ~ £' + costMax,
          saving: '£' + savingMin + ' ~ £' + savingMax
        });
      }
      return result;
    },
    goToFinanceDetail() {
      if (this.form.financeChoice.includes('loan') && this.form.financeChoice.includes('welfare')) {
        this.currentStep = 9;
      } else if (this.form.financeChoice.includes('loan')) {
        this.currentStep = 7;
      } else if (this.form.financeChoice.includes('welfare')) {
        this.currentStep = 8;
      }
    },
    // Regional cost factors
    regionCostFactor: {
      'Scotland': 1.0,
      'England': 1.1,
      'Wales': 1.08,
      'Northern Ireland': 0.95
    },
    // Regional energy saving factors
    regionSavingFactor: {
      'Scotland': 1.0,
      'England': 1.05,
      'Wales': 1.03,
      'Northern Ireland': 0.98
    },
    // Area factors (range)
    areaFactor: {
      '< 50 m²': { min: 0.6, max: 0.8 },
      '50-69 m²': { min: 0.8, max: 1.0 },
      '70–89 m²': { min: 1.0, max: 1.2 },
      '90–109 m²': { min: 1.2, max: 1.3 },
      '110–149 m²': { min: 1.3, max: 1.5 },
      '150-199 m²': { min: 1.5, max: 1.7 },
      '≥ 200m²': { min: 1.7, max: 2.0 }
    },
    getImprovementTotal() {
      // Calculate total cost and savings for selected improvement measures (range)
      const selected = this.form.improvementSelected;
      const all = this.getImprovements();
      let totalCostMin = 0, totalCostMax = 0;
      let totalSavingMin = 0, totalSavingMax = 0;
      for (const item of all) {
        if (selected.includes(item.name)) {
          // Parse range string "£1000 ~ £2000"
          const [costMin, costMax] = (item.cost || '').replace(/£/g,'').split('~').map(s => parseInt(s));
          const [savingMin, savingMax] = (item.saving || '').replace(/£/g,'').split('~').map(s => parseInt(s));
          if (!isNaN(costMin)) totalCostMin += costMin;
          if (!isNaN(costMax)) totalCostMax += costMax;
          if (!isNaN(savingMin)) totalSavingMin += savingMin;
          if (!isNaN(savingMax)) totalSavingMax += savingMax;
        }
      }
      return {
        cost: '£' + totalCostMin + ' ~ £' + totalCostMax,
        saving: '£' + totalSavingMin + ' ~ £' + totalSavingMax
      };
    },
  }
} 