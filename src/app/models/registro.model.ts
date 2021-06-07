

export class RegistroModel {

    public format: string;
    public text: string;
    public type: string;
    public icon: string;
    public created: Date;

    constructor( format: string, text: string ) {
        
        this.format = format;
        this.text = text;
        this.created = new Date()
        
        this.determinarTipo();
    }

    private determinarTipo() {
        
        const textoInicio = this.text.substr(0, 4);
        
        switch( textoInicio ) {
            
            case 'http':
                this.type = 'web';
                this.icon = 'globe-outline';
            break;

            case 'geo:': 
                this.type = 'maps';
                this.icon = 'location-outline';
            break;

            default: 
                this.type = 'No reconocido';
                this.icon = 'close-outline'
        }
    }
    
}