import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generatePDF = async ({
  title,
  data,
  columns,
  stats,
  fileName,
  onSuccess,
  onError
}) => {
  try {
    // Generate table rows HTML
    const tableRows = data.map(item => `
      <tr>
        ${columns.map(col => `<td>${item[col.key]}</td>`).join('')}
      </tr>
    `).join('');

    // Generate stats HTML if provided
    const statsHtml = stats ? `
      <div class="stats">
        ${Object.entries(stats).map(([key, value]) => `
          <div class="stat-item">
            <div class="stat-number">${value}</div>
            <div>${key}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #8e2a6b;
            }
            .stats {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              color: #8e2a6b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #8e2a6b;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .status-offered { color: #4CAF50; }
            .status-not-offered { color: #F44336; }
            .status-pending { color: #2196F3; }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .header {
                margin-bottom: 20px;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${statsHtml}

          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      width: 612, // US Letter width in points
      height: 792, // US Letter height in points
    });

    if (onSuccess) {
      onSuccess(uri);
    }

    return uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    if (onError) {
      onError(error);
    } else {
      Alert.alert('Error', 'Failed to generate PDF');
    }
    return null;
  }
};

export const sharePDF = async (uri, fileName) => {
  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: fileName,
    });
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Failed to share PDF');
  }
};

export const printPDF = async (uri) => {
  try {
    await Print.printAsync({
      uri,
    });
  } catch (error) {
    console.error('Print error:', error);
    Alert.alert('Error', 'Failed to print PDF');
  }
}; 