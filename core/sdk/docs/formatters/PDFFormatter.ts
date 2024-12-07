// core/sdk/docs/formatters/PDFFormatter.ts

private writeAPIDocs(pdf: PDFKit.PDFDocument, api: any): void {
  pdf.addPage();
  pdf.fontSize(16).text('API Documentation');
  pdf.moveDown();

  // Endpoints
  pdf.fontSize(14).text('Endpoints');
  for (const endpoint of api.endpoints) {
    pdf.fontSize(12).text(`${endpoint.method} ${endpoint.path}`);
    pdf.fontSize(10)
      .text(`Description: ${endpoint.description}`)
      .text(`Parameters:`)
      .moveDown(0.5);

    // Parameters table
    this.createTable(pdf, [
      ['Name', 'Type', 'Required', 'Description'],
      ...endpoint.parameters.map((param: any) => [
        param.name,
        param.type,
        param.required ? 'Yes' : 'No',
        param.description
      ])
    ]);

    pdf.moveDown()
      .text(`Returns: ${endpoint.returnType.type}`)
      .text(`${endpoint.returnType.description}`)
      .moveDown(2);
  }

  // Methods
  pdf.fontSize(14).text('Methods');
  for (const method of api.methods) {
    pdf.fontSize(12).text(method.name);
    pdf.fontSize(10)
      .text(`${method.accessibility || 'public'} ${method.isAsync ? 'async ' : ''}`)
      .text(`Description: ${method.description}`)
      .moveDown(0.5);

    if (method.parameters.length > 0) {
      this.createTable(pdf, [
        ['Parameter', 'Type', 'Optional', 'Description'],
        ...method.parameters.map((param: any) => [
          param.name,
          param.type,
          param.optional ? 'Yes' : 'No',
          param.description
        ])
      ]);
    }

    pdf.moveDown()
      .text(`Returns: ${method.returnType.type}`)
      .moveDown(2);
  }
}

private writeEventsDocs(pdf: PDFKit.PDFDocument, events: any): void {
  pdf.addPage();
  pdf.fontSize(16).text('Events Documentation');
  pdf.moveDown();

  // Emitted Events
  pdf.fontSize(14).text('Emitted Events');
  for (const event of events.emitted) {
    pdf.fontSize(12).text(event.name);
    pdf.fontSize(10)
      .text(`Description: ${event.description}`)
      .text('Payload:')
      .moveDown(0.5);

    if (event.payload) {
      this.createTable(pdf, [
        ['Field', 'Type', 'Description'],
        ...Object.entries(event.payload).map(([field, info]: [string, any]) => [
          field,
          info.type,
          info.description
        ])
      ]);
    }
    pdf.moveDown(2);
  }

  // Handled Events
  pdf.fontSize(14).text('Handled Events');
  for (const event of events.handled) {
    pdf.fontSize(12).text(event.name);
    pdf.fontSize(10)
      .text(`Description: ${event.description}`)
      .text(`Handler: ${event.handler}`)
      .moveDown(2);
  }
}

private writeConfigDocs(pdf: PDFKit.PDFDocument, config: any): void {
  pdf.addPage();
  pdf.fontSize(16).text('Configuration Documentation');
  pdf.moveDown();

  // Schema
  pdf.fontSize(14).text('Configuration Schema');
  this.createTable(pdf, [
    ['Option', 'Type', 'Required', 'Default', 'Description'],
    ...Object.entries(config.schema).map(([key, value]: [string, any]) => [
      key,
      value.type,
      value.required ? 'Yes' : 'No',
      value.default,
      value.description
    ])
  ]);
  pdf.moveDown(2);

  // Validation Rules
  pdf.fontSize(14).text('Validation Rules');
  for (const rule of config.validation) {
    pdf.fontSize(10)
      .text(`• ${rule.description}`)
      .moveDown(0.5);
  }
}

private writeExamples(pdf: PDFKit.PDFDocument, examples: any): void {
  pdf.addPage();
  pdf.fontSize(16).text('Examples');
  pdf.moveDown();

  for (const example of examples) {
    pdf.fontSize(14).text(example.name);
    pdf.fontSize(10).text(example.description);
    pdf.moveDown();
    
    // Code block
    pdf.font('Courier')
      .fontSize(9)
      .text(example.code, {
        width: 500,
        align: 'left',
        lineGap: 2
      });
    
    pdf.font('Helvetica')
      .moveDown(2);
  }
}

private createTable(pdf: PDFKit.PDFDocument, data: string[][]): void {
  const colWidths = this.calculateColumnWidths(data);
  const rowHeight = 20;
  let y = pdf.y;

  // Headers
  const headers = data[0];
  headers.forEach((header, i) => {
    pdf.text(header, pdf.x + this.sumArray(colWidths, 0, i), y, {
      width: colWidths[i],
      align: 'left'
    });
  });

  y += rowHeight;

  // Data
  data.slice(1).forEach(row => {
    row.forEach((cell, i) => {
      pdf.text(cell, pdf.x + this.sumArray(colWidths, 0, i), y, {
        width: colWidths[i],
        align: 'left'
      });
    });
    y += rowHeight;
  });

  pdf.y = y;
}

private calculateColumnWidths(data: string[][]): number[] {
  const columns = data[0].length;
  const totalWidth = 500; // Adjust based on page width
  return new Array(columns).fill(totalWidth / columns);
}

private sumArray(arr: number[], start: number, end: number): number {
  return arr.slice(start, end).reduce((sum, num) => sum + num, 0);
}
